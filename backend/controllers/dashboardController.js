const Course = require("../models/Course");
const InterviewPrep = require("../models/InterviewPrep");
const Roadmap = require("../models/Roadmap");
const Certificate = require("../models/Certificate");
const AuditLog = require("../models/AuditLog");

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the most recent items
    const [latestCourse, latestInterview, latestRoadmap] = await Promise.all([
      Course.findOne({ creator: userId }).sort({ updatedAt: -1 }),
      InterviewPrep.findOne({ user: userId, status: "pending" }).sort({ updatedAt: -1 }),
      Roadmap.findOne({ user: userId }).sort({ updatedAt: -1 }),
    ]);

    // Determine Continue Learning (most recently updated among them)
    let continueLearning = null;
    const candidates = [];
    
    if (latestCourse) candidates.push({ 
      type: "Course", 
      title: latestCourse.title, 
      id: latestCourse._id, 
      updatedAt: latestCourse.updatedAt,
      url: `/course/${latestCourse._id}`
    });
    
    if (latestInterview) candidates.push({ 
      type: "Interview Prep", 
      title: latestInterview.topic, 
      id: latestInterview._id, 
      updatedAt: latestInterview.updatedAt,
      url: `/interview-prep` 
    });
    
    if (latestRoadmap) candidates.push({ 
      type: "Roadmap", 
      title: latestRoadmap.goal, 
      id: latestRoadmap._id, 
      updatedAt: latestRoadmap.updatedAt,
      url: `/roadmaps` 
    });

    candidates.sort((a, b) => b.updatedAt - a.updatedAt);
    if (candidates.length > 0) {
      continueLearning = candidates[0];
    }

    // Build Recent Activity
    // Fetch 10 most recent across collections
    const recentCourses = await Course.find({ creator: userId }).sort({ createdAt: -1 }).limit(10).select('title createdAt _id');
    const recentInterviews = await InterviewPrep.find({ user: userId }).sort({ createdAt: -1 }).limit(10).select('topic createdAt _id status');
    const recentRoadmaps = await Roadmap.find({ user: userId }).sort({ createdAt: -1 }).limit(10).select('goal createdAt _id');

    let recentActivity = [];
    
    recentCourses.forEach(c => recentActivity.push({
      type: "Course",
      title: c.title,
      timestamp: c.createdAt,
      url: `/course/${c._id}`
    }));

    recentInterviews.forEach(i => recentActivity.push({
      type: i.status === 'completed' ? "Interview Completed" : "Interview Started",
      title: i.topic,
      timestamp: i.createdAt,
      url: `/interview-prep`
    }));

    recentRoadmaps.forEach(r => recentActivity.push({
      type: "Roadmap Generated",
      title: r.goal,
      timestamp: r.createdAt,
      url: `/roadmaps`
    }));

    // Sort all recent activity by timestamp desc, limit 10
    recentActivity.sort((a, b) => b.timestamp - a.timestamp);
    recentActivity = recentActivity.slice(0, 10);

    const quickActions = [
      { label: "Generate Course", url: "/", icon: "BookOpen" },
      { label: "Generate Roadmap", url: "/roadmaps", icon: "Layers" },
      { label: "Interview Prep", url: "/interview-prep", icon: "Brain" },
      { label: "Continue Learning", url: continueLearning ? continueLearning.url : "/", icon: "PlayCircle" },
      { label: "Ask AI", url: continueLearning && continueLearning.type === 'Course' ? continueLearning.url : "/", icon: "MessageSquare" }
    ];

    const coursesCreated = await Course.countDocuments({ creator: userId });
    const coursesCompleted = await Course.countDocuments({ creator: userId, earnedCertificateId: { $exists: true, $ne: "" } });
    const roadmapsCreated = await Roadmap.countDocuments({ user: userId });
    const interviewPacks = await InterviewPrep.countDocuments({ user: userId });
    const certificatesEarned = await Certificate.countDocuments({ user: userId });

    // User stats
    const User = require("../models/User");
    const userDoc = await User.findById(userId).select('studyStreak lastActiveDate activityHistory');

    // Aggregate real lesson-level stats across the user's courses
    const coursesWithLessons = await Course.find({ creator: userId })
      .populate({
        path: "modules",
        populate: { path: "lessons", select: "completedAt practiceLab aiConversation" },
      })
      .lean();

    let lessonsCompleted = 0;
    let practiceLabsGenerated = 0;
    let aiQuestionsAsked = 0;

    for (const course of coursesWithLessons) {
      for (const mod of course.modules || []) {
        for (const lesson of mod.lessons || []) {
          if (lesson.completedAt) lessonsCompleted++;
          if (lesson.practiceLab && lesson.practiceLab.title) practiceLabsGenerated++;
          if (Array.isArray(lesson.aiConversation)) {
            aiQuestionsAsked += lesson.aiConversation.filter((m) => m.role === "user").length;
          }
        }
      }
    }

    const flashcardsGenerated = await AuditLog.countDocuments({ userId, action: "GENERATED_FLASHCARDS" });

    const statistics = {
      coursesCreated,
      coursesCompleted,
      lessonsCompleted,
      roadmapsCreated,
      practiceLabsGenerated,
      flashcardsGenerated,
      interviewPacks,
      certificatesEarned,
      aiQuestionsAsked
    };

    // Weekly/monthly progress = share of the last 7/30 days on which the user was active
    const toDateStr = (d) => d.toISOString().slice(0, 10);
    const activityHistory = new Set(userDoc?.activityHistory || []);
    let activeDaysLast7 = 0;
    let activeDaysLast30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toDateStr(d);
      if (activityHistory.has(dateStr)) {
        activeDaysLast30++;
        if (i < 7) activeDaysLast7++;
      }
    }

    const progress = {
      overallCompletion: coursesCreated > 0 ? Math.round((coursesCompleted / coursesCreated) * 100) : 0,
      weeklyProgress: Math.round((activeDaysLast7 / 7) * 100),
      monthlyProgress: Math.round((activeDaysLast30 / 30) * 100)
    };

    const streak = {
      current: userDoc?.studyStreak || 0,
      longest: userDoc?.studyStreak || 0,
      lastActive: userDoc?.lastActiveDate || new Date().toISOString()
    };

    res.json({
      continueLearning,
      recentActivity,
      quickActions,
      statistics,
      progress,
      streak
    });

  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};
