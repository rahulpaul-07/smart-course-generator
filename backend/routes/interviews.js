const express = require("express");
const router = express.Router();
const { interviewGenLimiter, interviewAnswerLimiter } = require("../middlewares/aiRateLimiters");
const { aiLimiter } = require("../middlewares/rateLimit");
const validateObjectIds = require("../middlewares/validateObjectIds");
validateObjectIds(router);
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const {
  generateInterview,
  getMyInterviews,
  getInterviewById,
  submitInterview,
  chatInterview,
  deleteInterview,
} = require("../controllers/interviewController");

router.use(verifyAuth0Token);

router.post("/generate", interviewGenLimiter, aiLimiter, generateInterview);
router.get("/mine", getMyInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/submit", interviewAnswerLimiter, aiLimiter, submitInterview);
router.post("/:id/chat", interviewAnswerLimiter, aiLimiter, chatInterview);
router.delete("/:id", deleteInterview);

module.exports = router;
