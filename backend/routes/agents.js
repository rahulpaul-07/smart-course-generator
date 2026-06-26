const { Router } = require("express");
const { runCourseReviewer, runLearningCoach, runRevisionPlanner, runRecommendationAgent } = require("../controllers/agentController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");

const router = Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

router.use(verifyAuth0Token);

router.post("/reviewer", runCourseReviewer);
router.post("/coach", runLearningCoach);
router.post("/planner", runRevisionPlanner);
router.post("/recommend", runRecommendationAgent);

module.exports = router;

