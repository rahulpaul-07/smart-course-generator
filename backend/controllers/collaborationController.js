const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const AuditLog = require("../models/AuditLog");
const { recordActivity } = require("../services/achievementsService");
const { cloneCourseTree } = require("../services/courseClone");

async function getUserProfile(req, res) {
  const user = await User.findById(req.user._id).select("-password -auth0Id -googleId");
  res.json(user);
}

async function updateUserProfile(req, res) {
  // Only fields that were actually sent. $set-ing an undefined `name` fails
  // the required validator and turned a bio-only update into a 400.
  const update = {};
  for (const key of ["name", "bio", "isProfilePublic"]) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { returnDocument: "after", runValidators: true }
  ).select("-password -auth0Id -googleId");
  res.json(user);
}

async function getLeaderboard(req, res) {
  const topUsers = await User.find({ isProfilePublic: true })
    .select("name avatar studyStreak totalStudyMinutes xp achievements")
    .sort({ xp: -1, studyStreak: -1 })
    .limit(20)
    .lean();
  res.json(topUsers);
}

async function getPublicProfile(req, res) {
  const user = await User.findById(req.params.userId).select("name avatar bio studyStreak totalStudyMinutes xp achievements isProfilePublic");
  if (!user || !user.isProfilePublic) {
    res.status(404);
    throw new Error("Profile not found or is private");
  }
  
  // Fetch user's public courses
  const courses = await Course.find({ creator: user._id, isPublic: true })
    .select("title description upvotesCount clonesCount averageRating")
    .lean();
    
  res.json({ user, courses });
}

async function getCommunityTemplates(req, res) {
  // Hybrid model: get featured templates and highly active templates
  const templates = await Course.find({ isPublic: true })
    .select("title description isFeatured clonesCount upvotesCount averageRating createdAt language")
    .sort({ isFeatured: -1, upvotesCount: -1, clonesCount: -1 })
    .limit(20)
    .populate("creator", "name avatar")
    .lean();
    
  res.json(templates);
}

// getCommunityTemplates is a public, 60s-cached (by URL only, no user identity
// in the key -- see cacheMiddleware) response shared across every caller, so
// it must never carry a per-user field like "did I upvote this". Instead the
// current user's upvoted set is fetched separately, uncached, and merged
// client-side.
async function getMyUpvotedTemplateIds(req, res) {
  const upvoted = await Course.find({ isPublic: true, upvotedBy: req.user._id }).select("_id").lean();
  res.json(upvoted.map((c) => String(c._id)));
}

async function upvoteTemplate(req, res) {
  const courseId = req.params.courseId;
  const userId = req.user._id;

  // Conditional atomic updates instead of read-modify-write: two concurrent
  // clicks used to both read "not upvoted", both push, and double-count.
  let updated = await Course.findOneAndUpdate(
    { _id: courseId, isPublic: true, upvotedBy: { $ne: userId } },
    { $addToSet: { upvotedBy: userId }, $inc: { upvotesCount: 1 } },
    { returnDocument: "after" }
  ).select("title creator upvotesCount");
  let hasUpvoted = Boolean(updated);

  if (!updated) {
    updated = await Course.findOneAndUpdate(
      { _id: courseId, isPublic: true, upvotedBy: userId },
      { $pull: { upvotedBy: userId }, $inc: { upvotesCount: -1 } },
      { returnDocument: "after" }
    ).select("title creator upvotesCount");
  }

  if (!updated) {
    res.status(404);
    throw new Error("Template not found");
  }

  if (hasUpvoted) {
    await recordActivity(userId, "UPVOTED_COURSE", "Course", updated._id, { title: updated.title });
    // Upvoting your own course is allowed but earns the creator nothing.
    if (String(updated.creator) !== String(userId)) {
      await recordActivity(updated.creator, "COURSE_UPVOTED_BY_OTHER", "Course", updated._id, { title: updated.title, upvotedBy: userId });
    }
  }

  res.json({ success: true, upvotesCount: Math.max(0, updated.upvotesCount), hasUpvoted });
}

async function rateTemplate(req, res) {
  const { rating } = req.body;
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Invalid rating");
  }

  const template = await Course.findOne({ _id: req.params.courseId, isPublic: true });
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  // Check if user already rated
  const existingRatingIndex = template.ratings.findIndex(r => r.user.toString() === String(req.user._id));
  if (existingRatingIndex >= 0) {
    template.ratings[existingRatingIndex].rating = rating;
  } else {
    template.ratings.push({ user: req.user._id, rating });
  }

  // Recalculate average
  const total = template.ratings.reduce((sum, r) => sum + r.rating, 0);
  template.averageRating = total / template.ratings.length;
  
  await template.save();
  res.json({ success: true, averageRating: template.averageRating });
}

async function cloneTemplate(req, res) {
  const originalCourse = await Course.findOne({ _id: req.params.courseId, isPublic: true }).lean();
  if (!originalCourse) {
    res.status(404);
    throw new Error("Template not found");
  }

  const newCourse = await cloneCourseTree(originalCourse, req.user._id, { title: `${originalCourse.title} (Clone)` });
  await Course.updateOne({ _id: originalCourse._id }, { $inc: { clonesCount: 1 } });
  await recordActivity(req.user._id, "CLONED_COURSE", "Course", newCourse._id, { title: newCourse.title, originalCourseId: originalCourse._id });

  res.json({ success: true, courseId: newCourse._id });
}

async function getActivityFeed(req, res) {
  // Public and unauthenticated, so: only users who opted into a public
  // profile, and only display fields. It used to return every user's raw log
  // entries -- including private-profile users, private course titles and
  // certificate IDs from the metadata.
  const logs = await AuditLog.aggregate([
    { $match: { action: { $in: ["COMPLETED_COURSE", "PUBLISHED_COURSE", "UNLOCKED_ACHIEVEMENT"] } } },
    { $sort: { createdAt: -1 } },
    { $limit: 200 },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user", pipeline: [{ $project: { name: 1, avatar: 1, isProfilePublic: 1 } }] } },
    { $unwind: "$user" },
    { $match: { "user.isProfilePublic": true } },
    { $limit: 50 },
    {
      $project: {
        action: 1,
        createdAt: 1,
        userId: { _id: "$user._id", name: "$user.name", avatar: "$user.avatar" },
        metadata: { title: "$metadata.title", name: "$metadata.name" },
      },
    },
  ]);

  res.json(logs);
}

const asyncHandler = require("express-async-handler");

module.exports = {
  getUserProfile: asyncHandler(getUserProfile),
  updateUserProfile: asyncHandler(updateUserProfile),
  getLeaderboard: asyncHandler(getLeaderboard),
  getPublicProfile: asyncHandler(getPublicProfile),
  getCommunityTemplates: asyncHandler(getCommunityTemplates),
  getMyUpvotedTemplateIds: asyncHandler(getMyUpvotedTemplateIds),
  upvoteTemplate: asyncHandler(upvoteTemplate),
  rateTemplate: asyncHandler(rateTemplate),
  cloneTemplate: asyncHandler(cloneTemplate),
  getActivityFeed: asyncHandler(getActivityFeed)
};
