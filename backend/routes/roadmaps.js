const express = require("express");
const router = express.Router();
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { generateRoadmap, getMyRoadmaps, getRoadmapById, deleteRoadmap } = require("../controllers/roadmapController");

router.use(verifyAuth0Token);

router.post("/generate", generateRoadmap);
router.get("/mine", getMyRoadmaps);
router.get("/:id", getRoadmapById);
router.delete("/:id", deleteRoadmap);

module.exports = router;
