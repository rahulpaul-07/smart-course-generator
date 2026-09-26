const mongoose = require("mongoose");

const OBJECT_ID_PARAMS = ["id", "courseId", "lessonId", "userId"];

/**
 * Reject malformed ObjectId route params with a 400 before any handler runs.
 *
 * Registered with router.param() rather than router.use(): middleware mounted
 * with use() runs before the route is matched, so req.params is still empty
 * there and a check written that way silently validates nothing.
 */
function validateObjectIds(router) {
  for (const name of OBJECT_ID_PARAMS) {
    router.param(name, (req, res, next, value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          error: { message: `Invalid ${name}.`, code: "BAD_REQUEST" },
        });
      }
      next();
    });
  }
  return router;
}

module.exports = validateObjectIds;
module.exports.OBJECT_ID_PARAMS = OBJECT_ID_PARAMS;
