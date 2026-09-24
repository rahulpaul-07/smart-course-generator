const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const InterviewPrep = require("../models/InterviewPrep");
const Roadmap = require("../models/Roadmap");
const AuditLog = require("../models/AuditLog");
const RefreshToken = require("../models/RefreshToken");
const { cloneCourseTree } = require("./courseClone");
const { deleteCourseRecords } = require("./coursePersistence");

/**
 * One-click guest accounts for people evaluating the app.
 *
 * Every click gets its own isolated user rather than a shared "demo" login,
 * so one visitor can't delete or deface what the next one sees. Guests start
 * with a copy of a featured course (one lesson already done, so the dashboard
 * has something to show), can't publish to the community, and are purged
 * after DEMO_TTL_HOURS.
 */
const DEMO_TTL_HOURS = Number(process.env.DEMO_TTL_HOURS) || 24;
const PURGE_INTERVAL_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;

function isDemoEnabled() {
  return process.env.DEMO_MODE === "true";
}

async function createDemoUser() {
  const user = await User.create({
    name: "Guest Learner",
    email: `guest-${crypto.randomBytes(6).toString("hex")}@demo.courseai.local`,
    isDemo: true,
    onboardingCompleted: true,
    skillLevel: "intermediate",
    learningInterests: ["JavaScript", "System Design"],
  });

  const template = await Course.findOne({ isFeatured: true, isPublic: true })
    .sort({ createdAt: 1 })
    .lean();
  if (template) {
    const course = await cloneCourseTree(template, user._id);
    const firstModule = await Module.findById(course.modules[0]).lean();
    if (firstModule?.lessons?.length) {
      await Lesson.updateOne(
        { _id: firstModule.lessons[0] },
        { $set: { completedAt: new Date(), quizBestScore: 4, quizAttempts: 1, lastOpenedAt: new Date() } }
      );
    }
  }
  return user;
}

/** Delete expired guests and everything they own. Throttled; never throws. */
async function purgeExpiredDemoUsers({ force = false } = {}) {
  if (!force && Date.now() - lastPurgeAt < PURGE_INTERVAL_MS) return 0;
  lastPurgeAt = Date.now();
  try {
    const cutoff = new Date(Date.now() - DEMO_TTL_HOURS * 60 * 60 * 1000);
    const expired = await User.find({ isDemo: true, createdAt: { $lt: cutoff } }).select("_id").lean();
    for (const { _id } of expired) {
      const courses = await Course.find({ creator: _id });
      for (const course of courses) await deleteCourseRecords(course);
      await Promise.all([
        InterviewPrep.deleteMany({ user: _id }),
        Roadmap.deleteMany({ user: _id }),
        AuditLog.deleteMany({ userId: _id }),
        RefreshToken.deleteMany({ user: _id }),
        User.deleteOne({ _id }),
      ]);
    }
    return expired.length;
  } catch (err) {
    console.warn("Demo purge failed:", err.message);
    return 0;
  }
}

module.exports = { isDemoEnabled, createDemoUser, purgeExpiredDemoUsers, DEMO_TTL_HOURS };
