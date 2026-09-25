const { Router } = require("express");
const { runCourseReviewer, runLearningCoach, runRevisionPlanner, runRecommendationAgent } = require("../controllers/agentController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");

const router = Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

const { agentLimiter } = require("../middlewares/aiRateLimiters");

router.use(verifyAuth0Token);

router.post("/reviewer", agentLimiter, runCourseReviewer);
router.post("/coach", agentLimiter, runLearningCoach);
router.post("/planner", agentLimiter, runRevisionPlanner);
router.post("/recommend", agentLimiter, runRecommendationAgent);

module.exports = router;

