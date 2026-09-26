const express = require("express");
const router = express.Router();
const { roadmapGenLimiter } = require("../middlewares/aiRateLimiters");
const { aiLimiter } = require("../middlewares/rateLimit");
const validateObjectIds = require("../middlewares/validateObjectIds");
validateObjectIds(router);
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { generateRoadmap, getMyRoadmaps, getRoadmapById, toggleWeekCompletion, deleteRoadmap } = require("../controllers/roadmapController");

router.use(verifyAuth0Token);

router.post("/generate", roadmapGenLimiter, aiLimiter, generateRoadmap);
router.get("/mine", getMyRoadmaps);
router.get("/:id", getRoadmapById);
router.patch("/:id/progress", toggleWeekCompletion);
router.delete("/:id", deleteRoadmap);

module.exports = router;
