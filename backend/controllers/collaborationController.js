const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const AuditLog = require("../models/AuditLog");
const { recordActivity } = require("../services/achievementsService");

async function getUserProfile(req, res) {
  const user = await User.findById(req.user._id).select("-password -auth0Id");
  res.json(user);
}

async function updateUserProfile(req, res) {
  const { name, bio, isProfilePublic } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, bio, isProfilePublic } },
    { new: true, runValidators: true }
  ).select("-password -auth0Id");
  res.json(user);
}

async function getLeaderboard(req, res) {
  const topUsers = await User.find({ isProfilePublic: true })
    .select("name avatar studyStreak totalStudyMinutes xp achievements")
    .sort({ xp: -1, studyStreak: -1 })
    .limit(20);
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
    .select("title description upvotesCount clonesCount averageRating");
    
  res.json({ user, courses });
}

async function getCommunityTemplates(req, res) {
  // Hybrid model: get featured templates and highly active templates
  const templates = await Course.find({ isPublic: true })
    .select("title description isFeatured clonesCount upvotesCount averageRating createdAt language")
    .sort({ isFeatured: -1, upvotesCount: -1, clonesCount: -1 })
    .limit(20)
    .populate("creator", "name avatar");
    
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
  const template = await Course.findOne({ _id: req.params.courseId, isPublic: true });
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }

  const userId = String(req.user._id);
  const alreadyUpvoted = template.upvotedBy.some((id) => String(id) === userId);

  if (alreadyUpvoted) {
    template.upvotedBy = template.upvotedBy.filter((id) => String(id) !== userId);
    template.upvotesCount = Math.max(0, template.upvotesCount - 1);
  } else {
    template.upvotedBy.push(req.user._id);
    template.upvotesCount += 1;
  }

  await template.save();

  if (!alreadyUpvoted) {
    await recordActivity(req.user._id, "UPVOTED_COURSE", "Course", template._id, { title: template.title });
    await recordActivity(template.creator, "COURSE_UPVOTED_BY_OTHER", "Course", template._id, { title: template.title, upvotedBy: req.user._id });
  }

  res.json({ success: true, upvotesCount: template.upvotesCount, hasUpvoted: !alreadyUpvoted });
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
  const existingRatingIndex = template.ratings.findIndex(r => r.user.toString() === req.user._id);
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

  // Clone course
  const newCourse = new Course({
    creator: req.user._id,
    title: `${originalCourse.title} (Clone)`,
    description: originalCourse.description,
    language: originalCourse.language,
    isPublic: false,
    clonesCount: 0,
    upvotesCount: 0,
    ratings: [],
    averageRating: 0
  });
  
  await newCourse.save();

  // Find original modules
  const originalModules = await Module.find({ course: originalCourse._id }).lean();
  const originalModuleIds = originalModules.map(m => m._id);

  // Bulk fetch all lessons
  const allOriginalLessons = await Lesson.find({ module: { $in: originalModuleIds } }).lean();

  // Prepare and insert new modules
  const modulesToInsert = originalModules.map(om => ({
    course: newCourse._id,
    title: om.title,
    description: om.description,
    order: om.order
  }));
  
  let insertedModules = [];
  if (modulesToInsert.length > 0) {
    insertedModules = await Module.insertMany(modulesToInsert);
  }

  // Create mapping from original module ID to new module ID
  const moduleIdMap = {};
  originalModules.forEach((om, idx) => {
    moduleIdMap[om._id] = insertedModules[idx]._id;
  });

  // Prepare and insert new lessons
  const lessonsToInsert = allOriginalLessons.map(ol => ({
    module: moduleIdMap[ol.module],
    title: ol.title,
    description: ol.description,
    order: ol.order,
    content: ol.content,
    isEnriched: ol.isEnriched,
    generationStatus: ol.generationStatus,
    language: ol.language
  }));

  let insertedLessons = [];
  if (lessonsToInsert.length > 0) {
    insertedLessons = await Lesson.insertMany(lessonsToInsert);
  }

  const lessonIdsByModule = {};
  insertedLessons.forEach((lesson) => {
    const moduleId = String(lesson.module);
    if (!lessonIdsByModule[moduleId]) lessonIdsByModule[moduleId] = [];
    lessonIdsByModule[moduleId].push(lesson._id);
  });

  if (insertedModules.length > 0) {
    await Module.bulkWrite(
      insertedModules.map((moduleDoc) => ({
        updateOne: {
          filter: { _id: moduleDoc._id },
          update: { $set: { lessons: lessonIdsByModule[String(moduleDoc._id)] || [] } },
        },
      }))
    );
  }

  const newModuleIds = insertedModules.map(m => m._id);
  
  newCourse.modules = newModuleIds;
  await newCourse.save();

  // Increment clones count on original
  await Course.findByIdAndUpdate(originalCourse._id, { $inc: { clonesCount: 1 } });
  
  await recordActivity(req.user._id, "CLONED_COURSE", "Course", newCourse._id, { title: newCourse.title, originalCourseId: originalCourse._id });

  res.json({ success: true, courseId: newCourse._id });
}

async function getActivityFeed(req, res) {
  // Fetch recent 50 global activities that aren't private, joined with user details
  const logs = await AuditLog.find({
    action: { $in: ["COMPLETED_COURSE", "PUBLISHED_COURSE", "UNLOCKED_ACHIEVEMENT"] }
  })
  .sort({ createdAt: -1 })
  .limit(50)
  .populate("userId", "name avatar");
  
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
