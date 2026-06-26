const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");

async function getOwnedLesson(lessonId, userId) {
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    const error = new Error("Invalid lesson id.");
    error.statusCode = 400;
    throw error;
  }

  const lesson = await Lesson.findById(lessonId).populate({
    path: "module",
    populate: { path: "course" },
  });

  if (!lesson?.module?.course) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(lesson.module.course.creator) !== String(userId)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  return {
    lesson,
    moduleDoc: lesson.module,
    course: lesson.module.course,
  };
}

module.exports = { getOwnedLesson };
