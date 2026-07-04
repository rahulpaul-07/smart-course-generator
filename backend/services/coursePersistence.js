const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const { generateCourseImage } = require("./geminiService");

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

function buildBannerPrompt(course) {
  const skills = Array.isArray(course.skills) && course.skills.length > 0
    ? course.skills.slice(0, 5).join(", ")
    : "";
  const topic = [course.title, skills].filter(Boolean).join(" — ");
  return `A flat, modern, minimalist editorial illustration representing "${topic}". `
    + "Clean geometric shapes, professional tech-education style, wide banner composition, "
    + "no text, no letters, no logos.";
}

// Fire-and-forget: never let banner generation delay or fail course creation.
// Imagen calls commonly take longer than the rest of course generation, so
// `onBannerReady` (used to emit an SSE event) may fire after the response
// has already ended — callers must tolerate that no-op case.
function generateCourseBanner(course, onBannerReady) {
  const prompt = buildBannerPrompt(course);
  generateCourseImage(prompt)
    .then(async (bannerUrl) => {
      course.bannerUrl = bannerUrl;
      course.bannerStatus = "ready";
      await course.save();
      if (onBannerReady) onBannerReady(bannerUrl);
    })
    .catch(async (error) => {
      console.error("Course banner generation failed:", error.message);
      try {
        course.bannerStatus = "failed";
        await course.save();
      } catch (saveError) {
        console.error("Failed to persist banner failure status:", saveError.message);
      }
    });
}

module.exports = { deleteCourseRecords, saveGeneratedCourse, generateCourseBanner };
