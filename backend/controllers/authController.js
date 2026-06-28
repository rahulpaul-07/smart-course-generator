const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
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
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bookmarkedLessons: user.bookmarkedLessons,
    certificates: user.certificates,
    token,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    bookmarkedLessons: user.bookmarkedLessons,
    certificates: user.certificates,
    token,
  });
}

async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
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

  const token = generateToken(req.user._id);
  setTokenCookie(res, token);

  res.json(req.user);
}

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

async function googleLogin(req, res) {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("No token provided");
  }

  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch (verifyError) {
    res.status(401);
    throw new Error("Invalid Google token", { cause: verifyError });
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      onboardingCompleted: false
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.avatar) user.avatar = picture;
    await user.save();
  }

  const localToken = generateToken(user._id);
  setTokenCookie(res, localToken);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    onboardingCompleted: user.onboardingCompleted,
    bookmarkedLessons: user.bookmarkedLessons,
    certificates: user.certificates,
    token: localToken,
  });
}

const asyncHandler = require("express-async-handler");

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  logout: asyncHandler(logout),
  getMe: asyncHandler(getMe),
  auth0Sync: asyncHandler(auth0Sync),
  googleLogin: asyncHandler(googleLogin),
};
