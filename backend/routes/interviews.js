const express = require("express");
const router = express.Router();
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

router.post("/generate", generateInterview);
router.get("/mine", getMyInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/submit", submitInterview);
router.post("/:id/chat", chatInterview);
router.delete("/:id", deleteInterview);

module.exports = router;
