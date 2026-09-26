const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth0 /userinfo responses, keyed by access token. Bounded: every distinct
// token used to be kept until process exit, so memory grew with total logins.
const TOKEN_CACHE_MAX = 1000;
const tokenCache = new Map();

function cacheSet(token, entry) {
  if (tokenCache.size >= TOKEN_CACHE_MAX) {
    const now = Date.now();
    for (const [key, value] of tokenCache) {
      if (value.expiresAt <= now) tokenCache.delete(key);
    }
    // Still full of live entries: evict the oldest (Map preserves insertion order).
    if (tokenCache.size >= TOKEN_CACHE_MAX) {
      tokenCache.delete(tokenCache.keys().next().value);
    }
  }
  tokenCache.set(token, entry);
}

function tokenExpiry(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (payload.exp) return payload.exp * 1000;
  } catch {
    // opaque token -- fall through to the default
  }
  return Date.now() + 5 * 60 * 1000;
}

async function fetchAuth0Profile(token) {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.profilePromise;

  if (!process.env.AUTH0_DOMAIN) throw new Error("Auth0 domain not configured");

  const profilePromise = fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Auth0 rejected the access token");
    return response.json();
  });

  cacheSet(token, { profilePromise, expiresAt: tokenExpiry(token) });
  try {
    return await profilePromise;
  } catch (err) {
    tokenCache.delete(token);
    throw err;
  }
}

/**
 * Resolve (or provision) the local user for an Auth0 identity.
 *
 * Two account-takeover paths used to exist here:
 *  - A profile with no `email` claim ran `User.findOne({ email: undefined })`.
 *    Mongoose drops undefined keys, so that became `findOne({})` and signed the
 *    caller in as whichever user happened to be first in the collection.
 *  - An unverified email was linked to an existing local account with that
 *    address -- the same hole already closed for Google sign-in.
 */
async function resolveAuth0User(profile) {
  if (!profile?.sub) throw new Error("Auth0 profile has no subject");

  const bySub = await User.findOne({ auth0Id: profile.sub });
  if (bySub) return bySub;

  if (typeof profile.email !== "string" || !profile.email) {
    throw new Error("Auth0 profile has no email");
  }
  if (profile.email_verified !== true) {
    throw new Error("Auth0 email is not verified");
  }

  const email = profile.email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (!existing.auth0Id) {
      existing.auth0Id = profile.sub;
      await existing.save();
    }
    return existing;
  }

  return User.create({
    name: profile.name || profile.nickname || "Learner",
    email,
    auth0Id: profile.sub,
    avatar: profile.picture || "",
  });
}

function isLocalTokenShape(token) {
  const header = jwt.decode(token, { complete: true })?.header;
  return header?.alg === "HS256";
}

async function verifyAuth0Token(req, res, next) {
  // Bearer only. Accepting a cookie here would make every mutation
  // CSRF-able; the refresh cookie is scoped to /api/auth and never
  // authenticates a request on its own.
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }

  // 1. Local JWT (the common path).
  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    // Expired, forged, or not one of ours; handled below.
  }

  if (decoded) {
    try {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ error: "Account no longer exists" });
      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  }

  // An HS256 token is one of ours that failed verification (usually expired).
  // Sending it on to Auth0 would only turn every stale or forged token into an
  // outbound request; the client refreshes on this 401 instead.
  if (isLocalTokenShape(token) || !process.env.AUTH0_DOMAIN) {
    return res.status(401).json({ error: "Access token is invalid or expired" });
  }

  // 2. Auth0 access token.
  try {
    const profile = await fetchAuth0Profile(token);
    req.auth0User = profile;
    req.user = await resolveAuth0User(profile);
    return next();
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Auth0 verification failed:", err.message);
    }
    return res.status(401).json({ error: "Could not verify login token" });
  }
}

module.exports = { verifyAuth0Token, resolveAuth0User };
