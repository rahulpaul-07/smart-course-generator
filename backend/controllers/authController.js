const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  REFRESH_TOKEN_TTL_DAYS,
} = require("../services/tokenService");

const REFRESH_COOKIE = "refreshToken";
const ACCESS_COOKIE = "token"; // kept for the cookie fallback in verifyAuth0Token

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

function setAccessCookie(res, token) {
  // Short-lived; primarily for non-Bearer clients. The Bearer access token in
  // the response body is the primary credential for the SPA.
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    maxAge: 30 * 60 * 1000, // 30 minutes
  });
}

function clearAuthCookies(res) {
  res.cookie(ACCESS_COOKIE, "", { httpOnly: true, expires: new Date(0) });
  res.cookie(REFRESH_COOKIE, "", { httpOnly: true, path: "/api/auth", expires: new Date(0) });
}

/** Issue an access token + a fresh rotating refresh token, set cookies. */
async function issueSession(res, user) {
  const accessToken = signAccessToken(user._id);
  const refreshValue = await issueRefreshToken(user._id);
  setRefreshCookie(res, refreshValue);
  setAccessCookie(res, accessToken);
  return accessToken;
}

function userPayload(user, token) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    onboardingCompleted: user.onboardingCompleted,
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
    setAccessCookie(res, accessToken);
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
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "dummy_client_id");

async function googleLogin(req, res) {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("No token provided");
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (verifyError) {
    res.status(401);
    throw new Error("Invalid Google token", { cause: verifyError });
  }

  const { sub: googleId, email, email_verified: emailVerified, name, picture } = payload;

  // Reject unverified Google emails to prevent linking into an existing local
  // account via an unconfirmed address (account-takeover path).
  if (!emailVerified) {
    res.status(401);
    throw new Error("Google account email is not verified");
  }

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

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  refresh: asyncHandler(refresh),
  logout: asyncHandler(logout),
  getMe: asyncHandler(getMe),
  auth0Sync: asyncHandler(auth0Sync),
  googleLogin: asyncHandler(googleLogin),
};
