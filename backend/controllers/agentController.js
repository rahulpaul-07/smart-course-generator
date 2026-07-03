const agents = require("../services/agents/index");
const Course = require("../models/Course");
const User = require("../models/User");

// Caps free-typed list input (goals/interests) before it's embedded in an AI
// prompt, mirroring the .trim().slice(0, N) bound already applied to
// roadmap/course generation input elsewhere.
function sanitizeStringList(input, maxItems = 10, maxLen = 200) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => typeof item === "string" && item.trim())
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxLen));
}

async function runCourseReviewer(req, res) {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId is required" });

    const course = await Course.findOne({ _id: courseId, creator: req.user._id })
      .populate({ path: "modules", populate: { path: "lessons", select: "title content" } })
      .lean();

    if (!course) return res.status(404).json({ error: "Course not found" });

    let contentSample = `Course: ${course.title}\n`;
    (course.modules || []).forEach((m, i) => {
      contentSample += `Module ${i+1}: ${m.title}\n`;
      (m.lessons || []).forEach(l => {
        contentSample += ` - ${l.title}\n`;
      });
    });

    const user = await User.findById(req.user._id).select("name xp").lean();
    const userContext = `User ${user.name} with ${user.xp} XP`;

    const result = await agents.courseReviewerAgent(contentSample, userContext);
    res.json(result);
  } catch (error) {
    console.error("CourseReviewer Error:", error);
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runLearningCoach(req, res) {
  try {
    const user = await User.findById(req.user._id).select("studyStreak totalStudyMinutes activityHistory").lean();
    
    // Get recent scores from courses
    const courses = await Course.find({ creator: req.user._id })
      .populate({ path: "modules", populate: { path: "lessons", select: "title quizBestScore quizAttempts" } })
      .lean();

    let recentScores = [];
    for (const c of courses) {
      for (const m of (c.modules || [])) {
        for (const l of (m.lessons || [])) {
          if (l.quizAttempts > 0) {
            recentScores.push({ lesson: l.title, score: l.quizBestScore });
          }
        }
      }
    }
    
    // Sort and get last 5
    recentScores = recentScores.slice(-5);

    const userActivity = {
      streak: user.studyStreak || 0,
      totalMinutes: user.totalStudyMinutes || 0,
      recentActivity: (user.activityHistory || []).slice(-3)
    };

    const result = await agents.learningCoachAgent(userActivity, recentScores);
    res.json(result);
  } catch (error) {
    console.error("LearningCoach Error:", error);
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runRevisionPlanner(req, res) {
  try {
    const upcomingGoals = sanitizeStringList(req.body.upcomingGoals);

    // Extract weak topics
    const courses = await Course.find({ creator: req.user._id })
      .populate({ path: "modules", populate: { path: "lessons", select: "title quizBestScore quizAttempts" } })
      .lean();

    let weakTopics = [];
    for (const c of courses) {
      for (const m of (c.modules || [])) {
        for (const l of (m.lessons || [])) {
          if (l.quizAttempts > 0 && l.quizBestScore <= 3) {
            weakTopics.push(l.title);
          }
        }
      }
    }
    
    if (weakTopics.length === 0) weakTopics = ["General Review"];

    const result = await agents.revisionPlannerAgent(weakTopics, upcomingGoals.length ? upcomingGoals : ["Improve overall score"]);
    res.json(result);
  } catch (error) {
    console.error("RevisionPlanner Error:", error);
    res.status(500).json({ error: "Agent failed" });
  }
}

async function runRecommendationAgent(req, res) {
  try {
    const interests = sanitizeStringList(req.body.interests);

    const courses = await Course.find({ creator: req.user._id }).select("title").lean();
    const completedCourses = courses.map(c => c.title);

    const result = await agents.recommendationAgent(completedCourses, interests.length ? interests : ["General Programming"]);
    res.json(result);
  } catch (error) {
    console.error("RecommendationAgent Error:", error);
    res.status(500).json({ error: "Agent failed" });
  }
}

module.exports = {
  runCourseReviewer,
  runLearningCoach,
  runRevisionPlanner,
  runRecommendationAgent
};
