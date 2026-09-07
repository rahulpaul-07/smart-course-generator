const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Certificate = require("../models/Certificate");

/** Quizzes are generated as fixed 5-question sets; see studyGeneration.js. */
const PERFECT_QUIZ_SCORE = 5;

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

/**
 * Works out which badges `user` has just earned.
 *
 * This used to mutate `user.achievements` in place and leave the caller to
 * `save()` the whole document. Combined with the read-modify-write on `xp` in
 * recordActivity, two activities finishing close together (finish a lesson,
 * finish its quiz) both read the same starting XP and the second save
 * overwrote the first -- silently losing XP. It now returns the new badges and
 * writes nothing, so the caller can persist them with an atomic update.
 *
 * @returns {Promise<Array<{badge: string, name: string, description: string, unlockedAt: Date}>>}
 */
async function findNewlyUnlockedAchievements(user) {
  try {
    const certificatesCount = await Certificate.countDocuments({ user: user._id, passed: true });

    const courses = await Course.find({ creator: user._id }).select("_id isPublic upvotesCount");
    const publishedCoursesCount = courses.filter(c => c.isPublic).length;
    const totalUpvotes = courses.reduce((sum, c) => sum + (c.upvotesCount || 0), 0);

    const modules = await Module.find({ course: { $in: courses.map(c => c._id) } }).select("_id");
    const perfectQuizzesCount = await Lesson.countDocuments({
      module: { $in: modules.map(m => m._id) },
      quizBestScore: PERFECT_QUIZ_SCORE
    });

    const stats = {
      certificatesCount,
      publishedCoursesCount,
      totalUpvotes,
      perfectQuizzesCount
    };

    const currentBadges = new Set((user.achievements || []).map(a => a.badge));

    return ACHIEVEMENTS_LIST
      .filter(a => !currentBadges.has(a.badge) && a.check(user, stats))
      .map(a => ({
        badge: a.badge,
        name: a.name,
        description: a.description,
        unlockedAt: new Date()
      }));
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

/**
 * Back-compat wrapper for callers that hold a document and save it themselves.
 * @returns {Promise<boolean>} whether anything was appended.
 */
async function checkAndUnlockAchievements(user) {
  const unlocked = await findNewlyUnlockedAchievements(user);
  if (unlocked.length === 0) return false;
  user.achievements.push(...unlocked);
  await Promise.all(unlocked.map(a => AuditLog.create({
    userId: user._id,
    action: "UNLOCKED_ACHIEVEMENT",
    resourceType: "Achievement",
    resourceId: a.badge,
    metadata: { name: a.name, description: a.description },
    xpEarned: 0
  })));
  return true;
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
        if (metadata.score === PERFECT_QUIZ_SCORE) {
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

    // 3. Award XP and check achievements.
    //
    // $inc is applied server-side, so concurrent activities accumulate instead
    // of clobbering each other. The badge write is a separate $push guarded by
    // a $ne on the badge, which makes a double-unlock impossible even if two
    // requests evaluate the same condition at the same time.
    if (xpToAdd > 0 || action.includes("UNLOCKED")) {
      const user = xpToAdd > 0
        ? await User.findByIdAndUpdate(userId, { $inc: { xp: xpToAdd } }, { new: true })
        : await User.findById(userId);

      if (user) {
        const unlocked = await findNewlyUnlockedAchievements(user);
        for (const achievement of unlocked) {
          const res = await User.updateOne(
            { _id: userId, "achievements.badge": { $ne: achievement.badge } },
            { $push: { achievements: achievement } }
          );
          if (res.modifiedCount > 0) {
            await AuditLog.create({
              userId,
              action: "UNLOCKED_ACHIEVEMENT",
              resourceType: "Achievement",
              resourceId: achievement.badge,
              metadata: { name: achievement.name, description: achievement.description },
              xpEarned: 0
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to record activity or award XP:", error);
  }
}

module.exports = {
  recordActivity,
  checkAndUnlockAchievements,
  findNewlyUnlockedAchievements,
  ACHIEVEMENTS_LIST,
  PERFECT_QUIZ_SCORE
};
