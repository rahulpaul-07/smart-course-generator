const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const sessionCookie = req.headers.cookie
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("courseai_session="));
  const token = sessionCookie?.trim().slice("courseai_session=".length);

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const session = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(session.id).select("-password");

    if (!user) return res.status(401).json({ error: "User no longer exists" });

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

module.exports = { protect };
