// @desc    Process health (no dependency checks; see /api/health/readiness)
// @route   GET /api/health
// @access  Public
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend health check successful",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth
};
