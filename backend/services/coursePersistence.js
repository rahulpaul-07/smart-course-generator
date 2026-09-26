const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");

async function deleteCourseRecords(course) {
  const modules = await Module.find({ course: course._id }).select("_id");
  const moduleIds = modules.map((moduleDoc) => moduleDoc._id);

  const lessons = await Lesson.find({ module: { $in: moduleIds } }).select("_id");
  const lessonIds = lessons.map(l => l._id);

  if (lessonIds.length > 0) {
    await User.updateMany(
      { bookmarkedLessons: { $in: lessonIds } },
      { $pullAll: { bookmarkedLessons: lessonIds } }
    );
  }

  await Lesson.deleteMany({ module: { $in: moduleIds } });
  await Module.deleteMany({ course: course._id });
  await course.deleteOne();
}

async function saveGeneratedCourse(outline, userId, language = "English") {
  const course = await Course.create({
    title: outline.title,
    description: outline.description,
    creator: userId,
    language,
  });

  try {
    for (const moduleOutline of outline.modules) {
      const moduleDoc = await Module.create({
        title: moduleOutline.title,
        course: course._id,
      });
      const lessons = await Lesson.insertMany(moduleOutline.lessons.map((lesson) => ({
        title: lesson.title,
        module: moduleDoc._id,
      })));

      moduleDoc.lessons = lessons.map((lesson) => lesson._id);
      course.modules.push(moduleDoc._id);
      await moduleDoc.save();
    }

    await course.save();
    return course.populate({
      path: "modules",
      populate: { path: "lessons" },
    });
  } catch (error) {
    await deleteCourseRecords(course);
    throw error;
  }
}

module.exports = { deleteCourseRecords, saveGeneratedCourse };
