const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

/**
 * Deep-copy a course (modules and lessons, including generated content) into
 * a new private course owned by `creatorId`. Per-learner state -- completion,
 * quiz scores, notes, chat history -- is deliberately not copied.
 *
 * Four round-trips regardless of course size: one insert for the course, one
 * bulk insert each for modules and lessons, and one bulkWrite to link them.
 */
async function cloneCourseTree(original, creatorId, { title } = {}) {
  const newCourse = await Course.create({
    creator: creatorId,
    title: title || original.title,
    description: original.description,
    language: original.language,
    difficulty: original.difficulty,
    skills: original.skills,
    bannerUrl: original.bannerUrl,
    bannerStatus: original.bannerStatus,
    isPublic: false,
  });

  const originalModules = await Module.find({ course: original._id }).lean();
  // Keep curriculum order: the course's `modules` array is the source of truth.
  const position = new Map((original.modules || []).map((id, i) => [String(id), i]));
  originalModules.sort((a, b) => (position.get(String(a._id)) ?? 0) - (position.get(String(b._id)) ?? 0));

  const insertedModules = originalModules.length
    ? await Module.insertMany(originalModules.map((m) => ({ course: newCourse._id, title: m.title })))
    : [];
  const moduleIdMap = new Map(originalModules.map((m, i) => [String(m._id), insertedModules[i]._id]));

  const originalLessons = await Lesson.find({ module: { $in: originalModules.map((m) => m._id) } }).lean();
  const lessonOrder = new Map();
  for (const m of originalModules) (m.lessons || []).forEach((id, i) => lessonOrder.set(String(id), i));
  originalLessons.sort((a, b) => (lessonOrder.get(String(a._id)) ?? 0) - (lessonOrder.get(String(b._id)) ?? 0));

  const insertedLessons = originalLessons.length
    ? await Lesson.insertMany(originalLessons.map((l) => ({
        module: moduleIdMap.get(String(l.module)),
        title: l.title,
        content: l.content,
        outline: l.outline,
        videos: l.videos,
        practiceLab: l.practiceLab,
        flashcards: l.flashcards,
        isEnriched: l.isEnriched,
        generationStatus: l.generationStatus,
        language: l.language,
      })))
    : [];

  const lessonIdsByModule = new Map();
  for (const lesson of insertedLessons) {
    const key = String(lesson.module);
    if (!lessonIdsByModule.has(key)) lessonIdsByModule.set(key, []);
    lessonIdsByModule.get(key).push(lesson._id);
  }
  if (insertedModules.length) {
    await Module.bulkWrite(insertedModules.map((m) => ({
      updateOne: { filter: { _id: m._id }, update: { $set: { lessons: lessonIdsByModule.get(String(m._id)) || [] } } },
    })));
  }

  newCourse.modules = insertedModules.map((m) => m._id);
  await newCourse.save();
  return newCourse;
}

module.exports = { cloneCourseTree };
