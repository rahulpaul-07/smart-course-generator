const agents = require("../services/agents/index");

async function runCourseReviewer(req, res) {
  try {
    const { courseContent, userContext } = req.body;
    const result = await agents.courseReviewerAgent(courseContent, userContext);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runLearningCoach(req, res) {
  try {
    const { userActivity, recentScores } = req.body;
    const result = await agents.learningCoachAgent(userActivity, recentScores);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runRevisionPlanner(req, res) {
  try {
    const { weakTopics, upcomingGoals } = req.body;
    const result = await agents.revisionPlannerAgent(weakTopics, upcomingGoals);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runRecommendationAgent(req, res) {
  try {
    const { completedCourses, interests } = req.body;
    const result = await agents.recommendationAgent(completedCourses, interests);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Agent failed" });
  }
}

module.exports = {
  runCourseReviewer,
  runLearningCoach,
  runRevisionPlanner,
  runRecommendationAgent
};
