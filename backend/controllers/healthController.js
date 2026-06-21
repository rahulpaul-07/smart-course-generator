// @desc    Get system health status
// @route   GET /api/health
// @access  Public
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'System is healthy and running smoothly.',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
