const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  REFRESH_TOKEN_TTL_DAYS,
} = require("../services/tokenService");

const { isDemoEnabled, createDemoUser, purgeExpiredDemoUsers } = require("../services/demoService");

const REFRESH_COOKIE = "refreshToken";
// Legacy access-token cookie. No longer issued (the access token is Bearer-only,
// so cookie-authenticated cross-site requests are impossible), but still
// cleared on logout for browsers that hold one from an older session.
const LEGACY_ACCESS_COOKIE = "token";

function isProd() {
  return process.env.NODE_ENV === "production";
}

// Dependency-free cookie reader (the app doesn't use cookie-parser).
function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp("(?:^|\\s)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setRefreshCookie(res, value) {
  res.cookie(REFRESH_COOKIE, value, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  res.cookie(LEGACY_ACCESS_COOKIE, "", { httpOnly: true, expires: new Date(0) });
  res.cookie(REFRESH_COOKIE, "", { httpOnly: true, path: "/api/auth", expires: new Date(0) });
}

/** Issue an access token + a fresh rotating refresh token, set cookies. */
async function issueSession(res, user) {
  const accessToken = signAccessToken(user._id);
  const refreshValue = await issueRefreshToken(user._id);
  setRefreshCookie(res, refreshValue);
  return accessToken;
}

function userPayload(user, token) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    onboardingCompleted: user.onboardingCompleted,
    isDemo: Boolean(user.isDemo),
    bookmarkedLessons: user.bookmarkedLessons,
    certificates: user.certificates,
    token,
  };
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({ name, email, password });
  const token = await issueSession(res, user);
  res.status(201).json(userPayload(user, token));
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  const token = await issueSession(res, user);
  res.json(userPayload(user, token));
}

/** Rotate the refresh token (from httpOnly cookie) and mint a new access token. */
async function refresh(req, res) {
  const current = readCookie(req, REFRESH_COOKIE);
  try {
    const { userId, refreshValue } = await rotateRefreshToken(current);
    const user = await User.findById(userId);
    if (!user) {
      clearAuthCookies(res);
      res.status(401);
      throw new Error("User no longer exists");
    }
    const accessToken = signAccessToken(user._id);
    setRefreshCookie(res, refreshValue);
    res.json(userPayload(user, accessToken));
  } catch (err) {
    clearAuthCookies(res);
    res.status(err.status || 401);
    throw new Error(err.message || "Could not refresh session", { cause: err });
  }
}

async function logout(req, res) {
  const current = readCookie(req, REFRESH_COOKIE);
  await revokeRefreshToken(current);
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out successfully" });
}

async function getMe(req, res) {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  res.json(req.user);
}

async function auth0Sync(req, res) {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const token = await issueSession(res, req.user);
  res.json(userPayload(req.user, token));
}

const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client();

// Google OAuth web client IDs look like "<project number>-<id>.apps.googleusercontent.com".
const GOOGLE_CLIENT_ID_PATTERN = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;

/**
 * The configured Google client ID, or null when it is missing or malformed.
 *
 * verifyIdToken skips the audience check entirely when `audience` is
 * undefined, so with no client ID configured it accepted an ID token issued to
 * *any* Google app -- a token a third-party site received could be replayed
 * here to sign in as that user. Google sign-in must therefore be off unless a
 * well-formed client ID is set.
 */
function getGoogleClientId() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
  return GOOGLE_CLIENT_ID_PATTERN.test(clientId) ? clientId : null;
}

async function googleLogin(req, res) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    res.status(404);
    throw new Error("Google sign-in is not enabled on this server");
  }

  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("No token provided");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: clientId });
    payload = ticket.getPayload();
  } catch (verifyError) {
    res.status(401);
    throw new Error("Invalid Google token", { cause: verifyError });
  }

  const { sub: googleId, email_verified: emailVerified, name, picture } = payload;

  // Reject unverified Google emails to prevent linking into an existing local
  // account via an unconfirmed address (account-takeover path).
  if (!emailVerified) {
    res.status(401);
    throw new Error("Google account email is not verified");
  }

  const email = String(payload.email || "").toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, googleId, avatar: picture, onboardingCompleted: false });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.avatar) user.avatar = picture;
    await user.save();
  }

  const localToken = await issueSession(res, user);
  res.json(userPayload(user, localToken));
}

/** One-click guest session for evaluating the app (DEMO_MODE=true only). */
async function demoLogin(req, res) {
  if (!isDemoEnabled()) {
    res.status(404);
    throw new Error("Demo mode is not enabled on this server");
  }
  purgeExpiredDemoUsers(); // throttled, fire-and-forget
  const user = await createDemoUser();
  const token = await issueSession(res, user);
  res.status(201).json(userPayload(user, token));
}

/**
 * Turn the current guest account into a regular one, keeping everything the
 * guest created. Only valid for demo users; the address must be unused.
 */
async function claimGuest(req, res) {
  if (!req.user?.isDemo) {
    res.status(400);
    throw new Error("Only guest accounts can be claimed");
  }
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }
  const user = await User.findById(req.user._id).select("+password");
  user.name = name;
  user.email = email;
  user.password = password;
  user.isDemo = false;
  await user.save();

  // Rotate the session so no guest-era refresh token outlives the upgrade.
  await revokeRefreshToken(readCookie(req, REFRESH_COOKIE));
  const token = await issueSession(res, user);
  res.json(userPayload(user, token));
}

/** Public capability flags so the UI can hide options the server can't honour. */
function authConfig(req, res) {
  res.json({
    demo: isDemoEnabled(),
    google: Boolean(getGoogleClientId()),
    auth0: Boolean(process.env.AUTH0_DOMAIN),
  });
}

module.exports = {
  demoLogin: asyncHandler(demoLogin),
  claimGuest: asyncHandler(claimGuest),
  authConfig,
  register: asyncHandler(register),
  login: asyncHandler(login),
  refresh: asyncHandler(refresh),
  logout: asyncHandler(logout),
  getMe: asyncHandler(getMe),
  auth0Sync: asyncHandler(auth0Sync),
  googleLogin: asyncHandler(googleLogin),
};
