const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const tokenCache = new Map();

async function verifyAuth0Token(req, res, next) {
  let token = "";
  const authorization = req.headers.authorization || "";

  if (authorization.startsWith("Bearer ")) {
    token = authorization.slice(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|\s)token=([^;]*)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }

  // 1. Try verifying as local JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }
  } catch (jwtErr) {
    // Token is not a valid local JWT, try Auth0 validation
  }

  // 2. Try Auth0 verification
  try {
    let auth0Profile;
    const cached = tokenCache.get(token);
    
    if (cached && cached.expiresAt > Date.now()) {
      try {
        auth0Profile = await cached.profilePromise;
      } catch (err) {
        tokenCache.delete(token);
        throw err;
      }
    } else {
      if (!process.env.AUTH0_DOMAIN) {
        throw new Error("Auth0 domain not configured");
      }
      const fetchPromise = fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Auth0 rejected the access token");
        }
        return response.json();
      });

      let expiresAt = Date.now() + 5 * 60 * 1000; // fallback 5 mins
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.exp) {
          expiresAt = payload.exp * 1000;
        }
      } catch (e) {
        // ignore decoding errors, use fallback
      }

      tokenCache.set(token, { profilePromise: fetchPromise, expiresAt });

      try {
        auth0Profile = await fetchPromise;
      } catch (err) {
        tokenCache.delete(token);
        throw err;
      }
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ email: auth0Profile.email });
    if (!user) {
      user = await User.create({
        name: auth0Profile.name || auth0Profile.nickname || "Learner",
        email: auth0Profile.email,
        auth0Id: auth0Profile.sub, // The Auth0 user ID
      });
    }

    req.auth0User = auth0Profile;
    req.user = user; // Attach mongoose document for controllers
    return next();
  } catch (err) {
    console.error("Auth0 Verification Error:", err);
    return res.status(401).json({ error: "Could not verify login token" });
  }
}


module.exports = { verifyAuth0Token };
