const express = require("express");
const router = express.Router();
const { roadmapGenLimiter } = require("../middlewares/aiRateLimiters");
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { generateRoadmap, getMyRoadmaps, getRoadmapById, toggleWeekCompletion, deleteRoadmap } = require("../controllers/roadmapController");

router.use(verifyAuth0Token);

router.post("/generate", roadmapGenLimiter, generateRoadmap);
router.get("/mine", getMyRoadmaps);
router.get("/:id", getRoadmapById);
router.patch("/:id/progress", toggleWeekCompletion);
router.delete("/:id", deleteRoadmap);

module.exports = router;
