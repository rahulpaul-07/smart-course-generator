const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const InterviewPrep = require("../models/InterviewPrep");
const Roadmap = require("../models/Roadmap");
const Certificate = require("../models/Certificate");
const AuditLog = require("../models/AuditLog");
const { dayKey, DEFAULT_TIMEZONE } = require("../services/streakService");

/**
 * Lesson-level counters for a set of courses, computed in MongoDB.
 *
 * This used to populate courses -> modules -> lessons (including each lesson's
 * full AI chat transcript) into the Node process just to count a few flags --
 * O(total lessons) documents and payload on every dashboard load.
 */
async function lessonStats(courseIds) {
  const empty = { total: 0, completed: 0, labs: 0, aiQuestions: 0 };
  if (courseIds.length === 0) return empty;

  const moduleIds = await Module.find({ course: { $in: courseIds } }).distinct("_id");
  if (moduleIds.length === 0) return empty;

  const [row] = await Lesson.aggregate([
    { $match: { module: { $in: moduleIds } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $ifNull: ["$completedAt", false] }, 1, 0] } },
        labs: { $sum: { $cond: [{ $ifNull: ["$practiceLab.title", false] }, 1, 0] } },
        aiQuestions: {
          $sum: {
            $size: {
              $filter: {
                input: { $ifNull: ["$aiConversation", []] },
                cond: { $eq: ["$$this.role", "user"] },
              },
            },
          },
        },
      },
    },
  ]);
  return row || empty;
}

/** Share of the last `days` calendar days (in the user's zone) with activity. */
function activeDayShare(history, days, timeZone, now = new Date()) {
  const seen = new Set(history || []);
  let active = 0;
  for (let i = 0; i < days; i++) {
    if (seen.has(dayKey(new Date(now.getTime() - i * 86400000), timeZone))) active++;
  }
  return Math.round((active / days) * 100);
}

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Every query below is independent; they used to run one after another.
    const [
      latestCourse,
      latestInterview,
      latestRoadmap,
      recentCourses,
      recentInterviews,
      recentRoadmaps,
      courseIds,
      coursesCompleted,
      roadmapsCreated,
      interviewPacks,
      certificatesEarned,
      flashcardsGenerated,
      userDoc,
    ] = await Promise.all([
      Course.findOne({ creator: userId }).sort({ updatedAt: -1 }).select("title updatedAt").lean(),
      InterviewPrep.findOne({ user: userId, status: "pending" }).sort({ updatedAt: -1 }).select("topic updatedAt").lean(),
      Roadmap.findOne({ user: userId }).sort({ updatedAt: -1 }).select("goal updatedAt").lean(),
      Course.find({ creator: userId }).sort({ createdAt: -1 }).limit(10).select("title createdAt").lean(),
      InterviewPrep.find({ user: userId }).sort({ createdAt: -1 }).limit(10).select("topic createdAt status").lean(),
      Roadmap.find({ user: userId }).sort({ createdAt: -1 }).limit(10).select("goal createdAt").lean(),
      Course.find({ creator: userId }).distinct("_id"),
      Course.countDocuments({ creator: userId, earnedCertificateId: { $exists: true, $ne: "" } }),
      Roadmap.countDocuments({ user: userId }),
      InterviewPrep.countDocuments({ user: userId }),
      Certificate.countDocuments({ user: userId }),
      AuditLog.countDocuments({ userId, action: "GENERATED_FLASHCARDS" }),
      User.findById(userId).select("studyStreak longestStreak lastActiveDate activityHistory timezone").lean(),
    ]);

    const lessons = await lessonStats(courseIds);

    const candidates = [];
    if (latestCourse) {
      candidates.push({ type: "Course", title: latestCourse.title, id: latestCourse._id, updatedAt: latestCourse.updatedAt, url: `/course/${latestCourse._id}` });
    }
    if (latestInterview) {
      candidates.push({ type: "Interview Prep", title: latestInterview.topic, id: latestInterview._id, updatedAt: latestInterview.updatedAt, url: "/interview-prep" });
    }
    if (latestRoadmap) {
      candidates.push({ type: "Roadmap", title: latestRoadmap.goal, id: latestRoadmap._id, updatedAt: latestRoadmap.updatedAt, url: "/roadmaps" });
    }
    candidates.sort((a, b) => b.updatedAt - a.updatedAt);
    const continueLearning = candidates[0] || null;

    const recentActivity = [
      ...recentCourses.map((c) => ({ type: "Course", title: c.title, timestamp: c.createdAt, url: `/course/${c._id}` })),
      ...recentInterviews.map((i) => ({
        type: i.status === "completed" ? "Interview Completed" : "Interview Started",
        title: i.topic,
        timestamp: i.createdAt,
        url: "/interview-prep",
      })),
      ...recentRoadmaps.map((r) => ({ type: "Roadmap Generated", title: r.goal, timestamp: r.createdAt, url: "/roadmaps" })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    const quickActions = [
      { label: "Generate Course", url: "/dashboard", icon: "BookOpen" },
      { label: "Generate Roadmap", url: "/roadmaps", icon: "Layers" },
      { label: "Interview Prep", url: "/interview-prep", icon: "Brain" },
      { label: "Continue Learning", url: continueLearning ? continueLearning.url : "/dashboard", icon: "PlayCircle" },
      { label: "Ask AI", url: continueLearning?.type === "Course" ? continueLearning.url : "/dashboard", icon: "MessageSquare" },
    ];

    const statistics = {
      coursesCreated: courseIds.length,
      coursesCompleted,
      lessonsCompleted: lessons.completed,
      lessonsTotal: lessons.total,
      roadmapsCreated,
      practiceLabsGenerated: lessons.labs,
      flashcardsGenerated,
      interviewPacks,
      certificatesEarned,
      aiQuestionsAsked: lessons.aiQuestions,
    };

    // Streak days are keyed in the user's zone (see streakService), so the
    // active-day share must be too -- it used to compare against UTC dates.
    const timeZone = userDoc?.timezone || DEFAULT_TIMEZONE;
    const progress = {
      // Lesson-level. It was coursesCompleted / coursesCreated, so a learner
      // 90% of the way through their only course was shown as 0%.
      overallCompletion: lessons.total > 0 ? Math.round((lessons.completed / lessons.total) * 100) : 0,
      weeklyProgress: activeDayShare(userDoc?.activityHistory, 7, timeZone),
      monthlyProgress: activeDayShare(userDoc?.activityHistory, 30, timeZone),
    };

    const streak = {
      current: userDoc?.studyStreak || 0,
      longest: Math.max(userDoc?.longestStreak || 0, userDoc?.studyStreak || 0),
      lastActive: userDoc?.lastActiveDate || null,
    };

    res.json({ continueLearning, recentActivity, quickActions, statistics, progress, streak });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.activeDayShare = activeDayShare;
