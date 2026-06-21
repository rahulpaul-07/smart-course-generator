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
    .select("title description upvotesCount averageRating");
    
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

async function upvoteTemplate(req, res) {
  const template = await Course.findOneAndUpdate(
    { _id: req.params.courseId, isPublic: true },
    { $inc: { upvotesCount: 1 } },
    { new: true }
  );
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }
  
  await recordActivity(req.user._id, "UPVOTED_COURSE", "Course", template._id, { title: template.title });
  await recordActivity(template.creator, "COURSE_UPVOTED_BY_OTHER", "Course", template._id, { title: template.title, upvotedBy: req.user._id });
  
  res.json({ success: true, upvotesCount: template.upvotesCount });
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
  const newModuleIds = [];

  for (const om of originalModules) {
    const newModule = new Module({
      course: newCourse._id,
      title: om.title,
      description: om.description,
      order: om.order
    });
    await newModule.save();
    newModuleIds.push(newModule._id);

    const originalLessons = await Lesson.find({ module: om._id }).lean();
    for (const ol of originalLessons) {
      const newLesson = new Lesson({
        module: newModule._id,
        title: ol.title,
        description: ol.description,
        order: ol.order,
        content: ol.content,
        isEnriched: ol.isEnriched,
        generationStatus: ol.generationStatus,
        language: ol.language
      });
      await newLesson.save();
    }
  }

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
  upvoteTemplate: asyncHandler(upvoteTemplate),
  rateTemplate: asyncHandler(rateTemplate),
  cloneTemplate: asyncHandler(cloneTemplate),
  getActivityFeed: asyncHandler(getActivityFeed)
};
