const { Router } = require("express");
const { runCourseReviewer, runLearningCoach, runRevisionPlanner, runRecommendationAgent } = require("../controllers/agentController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");

const router = Router();

const { agentLimiter } = require("../middlewares/aiRateLimiters");
const { aiLimiter } = require("../middlewares/rateLimit");

router.use(verifyAuth0Token);

router.post("/reviewer", agentLimiter, aiLimiter, runCourseReviewer);
router.post("/coach", agentLimiter, aiLimiter, runLearningCoach);
router.post("/planner", agentLimiter, aiLimiter, runRevisionPlanner);
router.post("/recommend", agentLimiter, aiLimiter, runRecommendationAgent);

module.exports = router;

