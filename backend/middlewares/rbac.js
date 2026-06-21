const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select("role").lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    next();
  } catch (error) {
    console.error("RBAC Error:", error);
    res.status(500).json({ error: "Internal server error during authorization" });
  }
};

module.exports = { requireAdmin };
