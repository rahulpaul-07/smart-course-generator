const Course = require("../models/Course");
const User = require("../models/User");
const { applyStreak } = require("../services/streakService");

/**
 * GET /api/analytics/dashboard
 * Returns comprehensive learning analytics for the authenticated user.
 */
async function getDashboard(req, res) {
  try {
    const userId = req.user._id;

    // Fetch user analytics fields
    const user = await User.findById(userId)
      .select("studyStreak longestStreak lastActiveDate activityHistory totalStudyMinutes xp achievements")
      .lean();

    // Fetch all courses with populated modules/lessons
    const courses = await Course.find({ creator: userId })
      .populate({
        path: "modules",
        populate: { path: "lessons", select: "title completedAt quizBestScore quizAttempts" },
      })
      .lean();

    let totalLessons = 0;
    let completedLessons = 0;
    let totalQuizScore = 0;
    let totalQuizAttempts = 0;
    const weakTopics = [];
    const strongTopics = [];
    const courseStats = [];

    for (const course of courses) {
      let courseLessons = 0;
      let courseCompleted = 0;

      for (const mod of course.modules || []) {
        for (const lesson of mod.lessons || []) {
          totalLessons++;
          courseLessons++;

          if (lesson.completedAt) {
            completedLessons++;
            courseCompleted++;
          }

          if (lesson.quizAttempts > 0) {
            totalQuizAttempts++;
            totalQuizScore += lesson.quizBestScore;

            if (lesson.quizBestScore <= 2) {
              weakTopics.push({ lesson: lesson.title, course: course.title, score: lesson.quizBestScore });
            } else if (lesson.quizBestScore >= 4) {
              strongTopics.push({ lesson: lesson.title, course: course.title, score: lesson.quizBestScore });
            }
          }
        }
      }

      courseStats.push({
        _id: course._id,
        title: course.title,
        totalLessons: courseLessons,
        completedLessons: courseCompleted,
        completionPct: courseLessons > 0 ? Math.round((courseCompleted / courseLessons) * 100) : 0,
        hasCertificate: !!course.earnedCertificateId,
      });
    }

    const overallCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const avgQuizScore = totalQuizAttempts > 0 ? +(totalQuizScore / totalQuizAttempts).toFixed(1) : 0;

    return res.json({
      studyStreak: user?.studyStreak || 0,
      totalStudyMinutes: user?.totalStudyMinutes || 0,
      totalStudyHours: +((user?.totalStudyMinutes || 0) / 60).toFixed(1),
      activityHistory: (user?.activityHistory || []).slice(-90),
      totalCourses: courses.length,
      totalLessons,
      completedLessons,
      overallCompletion,
      avgQuizScore,
      maxQuizScore: 5,
      xp: user?.xp || 0,
      achievements: user?.achievements || [],
      weakTopics: weakTopics.slice(0, 10),
      strongTopics: strongTopics.slice(0, 10),
      courseStats,
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return res.status(500).json({ error: "Failed to load analytics" });
  }
}

/**
 * POST /api/analytics/study-time
 * Increments the user's active study minutes and updates streak.
 */
async function recordStudyTime(req, res) {
  try {
    const userId = req.user._id;
    const minutes = Math.min(Math.max(Number(req.body?.minutes) || 1, 1), 30);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.totalStudyMinutes = (user.totalStudyMinutes || 0) + minutes;

    applyStreak(user, { timeZone: req.body?.timezone });

    await user.save();
    return res.json({
      totalStudyMinutes: user.totalStudyMinutes,
      studyStreak: user.studyStreak,
      longestStreak: user.longestStreak,
    });
  } catch (error) {
    console.error("Record study time error:", error);
    return res.status(500).json({ error: "Failed to record study time" });
  }
}

module.exports = { getDashboard, recordStudyTime };
