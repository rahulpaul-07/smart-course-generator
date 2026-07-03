const User = require("../models/User");
const Lesson = require("../models/Lesson");

// Bookmarking (and checking bookmark status) reads lesson data back through
// getBookmarks' populate chain, so it must not let a user attach an arbitrary
// lessonId belonging to someone else's private course -- only lessons the
// user owns or that belong to a published (isPublic) course are bookmarkable.
async function assertLessonAccessible(res, lessonId, userId) {
  const lesson = await Lesson.findById(lessonId).populate({
    path: "module",
    select: "course",
    populate: { path: "course", select: "creator isPublic" },
  });

  if (!lesson?.module?.course) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  const { course } = lesson.module;
  const isOwner = String(course.creator) === String(userId);
  if (!isOwner && !course.isPublic) {
    res.status(403);
    throw new Error("Forbidden");
  }

  return lesson;
}

async function toggleBookmark(req, res) {
  const { lessonId } = req.params;
  const userId = req.user._id;

  await assertLessonAccessible(res, lessonId, userId);

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if it's already bookmarked
  const isBookmarked = user.bookmarkedLessons.includes(lessonId);

  if (isBookmarked) {
    // Remove it
    user.bookmarkedLessons = user.bookmarkedLessons.filter(id => id.toString() !== lessonId);
  } else {
    // Add it
    user.bookmarkedLessons.push(lessonId);
  }

  await user.save();

  return res.json({ 
    isBookmarked: !isBookmarked,
    message: isBookmarked ? "Lesson removed from bookmarks" : "Lesson bookmarked successfully" 
  });
}

async function getBookmarks(req, res) {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: "bookmarkedLessons",
    select: "title description language isEnriched module", // Select fields we need
    populate: {
      path: "module",
      select: "title course",
      populate: {
        path: "course",
        select: "title description"
      }
    }
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Filter out any orphaned bookmarks (e.g. if a lesson was deleted)
  const validBookmarks = user.bookmarkedLessons.filter(lesson => lesson !== null);
  
  // If we cleaned up orphans, save the user
  if (validBookmarks.length !== user.bookmarkedLessons.length) {
    user.bookmarkedLessons = validBookmarks.map(l => l._id);
    await user.save();
  }

  return res.json({ bookmarks: validBookmarks });
}

async function checkBookmark(req, res) {
  const { lessonId } = req.params;

  await assertLessonAccessible(res, lessonId, req.user._id);

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isBookmarked = user.bookmarkedLessons.includes(lessonId);
  return res.json({ isBookmarked });
}

async function updateOnboarding(req, res) {
  const { skillLevel, learningInterests } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.skillLevel = skillLevel || user.skillLevel;
  user.learningInterests = learningInterests || user.learningInterests;
  user.onboardingCompleted = true;
  
  await user.save();
  
  res.json(user);
}

async function updateProfile(req, res) {
  const { bio, avatar, isProfilePublic, name, skillLevel, learningInterests } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (isProfilePublic !== undefined) user.isProfilePublic = isProfilePublic;
  if (name !== undefined) user.name = name;
  if (skillLevel !== undefined) user.skillLevel = skillLevel;
  if (learningInterests !== undefined) user.learningInterests = learningInterests;
  
  await user.save();
  res.json(user);
}

async function updateSettings(req, res) {
  const { theme } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (theme !== undefined) user.theme = theme;
  
  await user.save();
  res.json(user);
}

const asyncHandler = require("express-async-handler");

module.exports = {
  toggleBookmark: asyncHandler(toggleBookmark),
  getBookmarks: asyncHandler(getBookmarks),
  checkBookmark: asyncHandler(checkBookmark),
  updateOnboarding: asyncHandler(updateOnboarding),
  updateProfile: asyncHandler(updateProfile),
  updateSettings: asyncHandler(updateSettings)
};
