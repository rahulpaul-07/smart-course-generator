const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Certificate = require("../models/Certificate");

const ACHIEVEMENTS_LIST = [
  {
    badge: "streak-3",
    name: "Streak Starter",
    description: "Study for 3 consecutive days",
    check: (user, stats) => user.studyStreak >= 3
  },
  {
    badge: "streak-7",
    name: "Consistency Champion",
    description: "Study for 7 consecutive days",
    check: (user, stats) => user.studyStreak >= 7
  },
  {
    badge: "streak-30",
    name: "Unstoppable Learner",
    description: "Study for 30 consecutive days",
    check: (user, stats) => user.studyStreak >= 30
  },
  {
    badge: "course-1",
    name: "First Step",
    description: "Earn your first course certificate",
    check: (user, stats) => stats.certificatesCount >= 1
  },
  {
    badge: "course-5",
    name: "Polymath in Training",
    description: "Earn 5 course certificates",
    check: (user, stats) => stats.certificatesCount >= 5
  },
  {
    badge: "quiz-1",
    name: "Quiz Master",
    description: "Score a perfect 5/5 on a quiz",
    check: (user, stats) => stats.perfectQuizzesCount >= 1
  },
  {
    badge: "quiz-3",
    name: "Trivia King",
    description: "Score a perfect 5/5 on 3 distinct quizzes",
    check: (user, stats) => stats.perfectQuizzesCount >= 3
  },
  {
    badge: "publish-1",
    name: "Philanthropist",
    description: "Publish a course to the community marketplace",
    check: (user, stats) => stats.publishedCoursesCount >= 1
  },
  {
    badge: "upvotes-10",
    name: "Crowd Pleaser",
    description: "Get 10 total upvotes on your published courses",
    check: (user, stats) => stats.totalUpvotes >= 10
  }
];

async function checkAndUnlockAchievements(user) {
  try {
    // Gather stats
    const certificatesCount = await Certificate.countDocuments({ user: user._id, passed: true });
    
    const courses = await Course.find({ creator: user._id }).select("_id isPublic upvotesCount");
    const publishedCoursesCount = courses.filter(c => c.isPublic).length;
    const totalUpvotes = courses.reduce((sum, c) => sum + (c.upvotesCount || 0), 0);
    
    const modules = await Module.find({ course: { $in: courses.map(c => c._id) } }).select("_id");
    const perfectQuizzesCount = await Lesson.countDocuments({ 
      module: { $in: modules.map(m => m._id) }, 
      quizBestScore: 5 
    });

    const stats = {
      certificatesCount,
      publishedCoursesCount,
      totalUpvotes,
      perfectQuizzesCount
    };

    let newlyUnlocked = false;
    const currentBadges = user.achievements.map(a => a.badge);

    for (const achievement of ACHIEVEMENTS_LIST) {
      if (!currentBadges.includes(achievement.badge)) {
        if (achievement.check(user, stats)) {
          user.achievements.push({
            badge: achievement.badge,
            name: achievement.name,
            description: achievement.description,
            unlockedAt: new Date()
          });
          newlyUnlocked = true;
          
          // Optionally record achievement unlock to feed
          await AuditLog.create({
            userId: user._id,
            action: "UNLOCKED_ACHIEVEMENT",
            resourceType: "Achievement",
            resourceId: achievement.badge,
            metadata: { name: achievement.name, description: achievement.description },
            xpEarned: 0
          });
        }
      }
    }

    if (newlyUnlocked) {
      await user.save();
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

async function recordActivity(userId, action, resourceType, resourceId, metadata = {}) {
  try {
    // 1. Calculate XP based on the action
    let xpToAdd = 0;
    switch (action) {
      case "COMPLETED_LESSON":
        xpToAdd = 10;
        break;
      case "COMPLETED_QUIZ":
        xpToAdd = 25;
        if (metadata.score === 5) {
          xpToAdd += 20; // 5/5 perfect score bonus!
        }
        break;
      case "COMPLETED_COURSE": // e.g. final test passed
        xpToAdd = 100;
        break;
      case "PUBLISHED_COURSE":
        xpToAdd = 50;
        break;
      case "CLONED_COURSE":
        xpToAdd = 20;
        break;
      case "UPVOTED_COURSE":
        xpToAdd = 1; // Voter XP
        break;
      case "COURSE_UPVOTED_BY_OTHER":
        xpToAdd = 5; // Creator XP
        break;
      case "DAILY_STREAK":
        xpToAdd = 15;
        break;
      case "GENERATED_FLASHCARDS":
        xpToAdd = 10;
        break;
      case "STUDIED_FLASHCARDS":
        xpToAdd = 5;
        break;
      default:
        xpToAdd = 0;
    }

    // 2. Create the audit/activity log
    await AuditLog.create({
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
      xpEarned: xpToAdd
    });

    // 3. Award XP and check achievements
    if (xpToAdd > 0 || action.includes("UNLOCKED")) {
      const user = await User.findById(userId);
      if (user) {
        user.xp = (user.xp || 0) + xpToAdd;
        await checkAndUnlockAchievements(user);
        await user.save();
      }
    }
  } catch (error) {
    console.error("Failed to record activity or award XP:", error);
  }
}

module.exports = {
  recordActivity,
  checkAndUnlockAchievements
};
