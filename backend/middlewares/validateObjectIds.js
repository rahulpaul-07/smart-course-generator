const mongoose = require("mongoose");

const validateObjectIds = (req, res, next) => {
  const objectIdParams = ['id', 'courseId', 'lessonId', 'userId', 'certificateId', 'shareId'];
  for (const param of objectIdParams) {
    if (req.params[param] && !mongoose.Types.ObjectId.isValid(req.params[param])) {
      return res.status(400).json({ error: `Invalid ${param}.` });
    }
  }
  next();
};

module.exports = validateObjectIds;
