const mongoose = require("mongoose");
const Roadmap = require("../models/Roadmap");
const aiRouter = require("../services/aiRouter");

/**
 * POST /api/roadmaps/generate
 * Generates an AI-powered weekly learning roadmap.
 */
async function generateRoadmap(req, res) {
  try {
    const { goal, duration, skillLevel } = req.body;

    if (!goal || !duration || !skillLevel) {
      return res.status(400).json({ error: "Goal, duration, and skillLevel are required." });
    }

    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(skillLevel)) {
      return res.status(400).json({ error: "skillLevel must be beginner, intermediate, or advanced." });
    }

    const systemPrompt = `You are an expert learning path architect. Generate a structured weekly learning roadmap as JSON.
The response must be valid JSON matching this exact schema:
{
  "summary": "A 1-2 sentence overview of the roadmap",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week title",
      "topics": ["Topic 1", "Topic 2"],
      "milestones": ["Milestone 1"],
      "project": {
        "title": "Mini project title",
        "description": "Brief project description"
      }
    }
  ]
}
Rules:
- Each week should have 2-5 topics, 1-3 milestones, and 1 project.
- Projects should progressively build in complexity.
- Milestones should be measurable and specific.
- Tailor difficulty to the skill level provided.`;

    const userPrompt = `Create a learning roadmap for:
- Goal: ${goal}
- Duration: ${duration}
- Current Skill Level: ${skillLevel}

Generate the complete week-by-week roadmap.`;

    const result = await aiRouter.generateJson(systemPrompt, userPrompt, 2048);

    const parsedWeeks = result.weeks || result.roadmap?.weeks || result.roadmap || [];
    const parsedSummary = result.summary || result.roadmap?.summary || "";

    if (!Array.isArray(parsedWeeks) || parsedWeeks.length === 0) {
      return res.status(502).json({ error: "The AI returned an invalid roadmap. Please try again." });
    }

    for (const w of parsedWeeks) {
      if (!w.title || typeof w.title !== "string" || !w.title.trim()) {
        return res.status(502).json({ error: "The AI returned an invalid roadmap. Please try again." });
      }
      if (!Array.isArray(w.topics) || w.topics.length === 0) {
        return res.status(502).json({ error: "The AI returned an invalid roadmap. Please try again." });
      }
      if (!w.project || typeof w.project !== "object" || Array.isArray(w.project) || !w.project.title || typeof w.project.title !== "string" || !w.project.title.trim()) {
        return res.status(502).json({ error: "The AI returned an invalid roadmap. Please try again." });
      }
    }

    const weeks = (Array.isArray(parsedWeeks) ? parsedWeeks : []).map((w, i) => ({
      weekNumber: i + 1,
      title: w.title || `Week ${i + 1}`,
      topics: Array.isArray(w.topics) ? w.topics : [],
      milestones: Array.isArray(w.milestones) ? w.milestones : [],
      project: {
        title: w.project?.title || "",
        description: w.project?.description || "",
      },
    }));

    const roadmap = await Roadmap.create({
      user: req.user._id,
      goal,
      duration,
      skillLevel,
      summary: parsedSummary,
      weeks,
    });

    return res.status(201).json(roadmap);
  } catch (error) {
    console.error("Generate roadmap error:", error);
    return res.status(500).json({ error: "Failed to generate roadmap. Please try again." });
  }
}

/**
 * GET /api/roadmaps/mine
 */
async function getMyRoadmaps(req, res) {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id })
      .select("goal duration skillLevel summary createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(roadmaps);
  } catch (error) {
    console.error("Get roadmaps error:", error);
    return res.status(500).json({ error: "Failed to load roadmaps" });
  }
}

/**
 * GET /api/roadmaps/:id
 */
async function getRoadmapById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid roadmap id." });
    }
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
    return res.json(roadmap);
  } catch (error) {
    console.error("Get roadmap error:", error);
    return res.status(500).json({ error: "Failed to load roadmap" });
  }
}

/**
 * DELETE /api/roadmaps/:id
 */
async function deleteRoadmap(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid roadmap id." });
    }
    const result = await Roadmap.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Roadmap not found" });
    return res.json({ message: "Roadmap deleted" });
  } catch (error) {
    console.error("Delete roadmap error:", error);
    return res.status(500).json({ error: "Failed to delete roadmap" });
  }
}

module.exports = { generateRoadmap, getMyRoadmaps, getRoadmapById, deleteRoadmap };
