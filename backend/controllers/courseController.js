const crypto = require("crypto");
const Course = require("../models/Course");
const User = require("../models/User");
const { deleteCourseRecords } = require("../services/coursePersistence");
const { getOwnedLesson } = require("../services/lessonAccessService");
const aiRouter = require("../services/aiRouter");
const Certificate = require("../models/Certificate");
const { recordActivity } = require("../services/achievementsService");

const COURSE_OUTLINE = {
  path: "modules",
  select: "title lessons",
  populate: {
    path: "lessons",
    select: "title isEnriched completedAt bookmarked lastOpenedAt quizBestScore quizAttempts",
  },
};

function ownsCourse(course, userId) {
  return String(course.creator) === String(userId);
}

async function getMyCourses(req, res) {
  const courses = await Course.find({ creator: req.user._id })
    .select("title description modules isPublic shareId createdAt")
    .sort({ createdAt: -1 })
    .populate(COURSE_OUTLINE)
    .lean();

  return res.json(courses);
}

async function getCourseById(req, res) {
  const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id })
    .select("title description modules isPublic shareId creator finalTest")
    .populate(COURSE_OUTLINE)
    .lean();

  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!ownsCourse(course, req.user._id)) return res.status(403).json({ error: "Forbidden" });

  const certificate = await Certificate.findOne({ course: course._id, user: req.user._id }).lean();
  if (certificate) {
    course.earnedCertificateId = certificate.certificateId;
  }

  delete course.creator;
  return res.json(course);
}

async function getLessonView(req, res) {
  const context = await getOwnedLesson(req.params.lessonId, req.user._id);
  if (String(context.course._id) !== String(req.params.courseId)) {
    return res.status(404).json({ error: "Lesson not found in this course" });
  }

  // Automatically update lastOpenedAt when the lesson is viewed
  context.lesson.lastOpenedAt = new Date();
  await context.lesson.save();

  const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id })
    .select("title description modules")
    .populate(COURSE_OUTLINE)
    .lean();

  return res.json({
    course,
    lesson: context.lesson.toObject({ depopulate: true }),
  });
}

async function deleteCourse(req, res) {
  const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id });
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!ownsCourse(course, req.user._id)) return res.status(403).json({ error: "Forbidden" });

  await deleteCourseRecords(course);

  return res.json({ message: "Course deleted" });
}

async function updateLessonProgress(req, res) {
  const { lesson } = await getOwnedLesson(req.params.lessonId, req.user._id);

  if (req.body?.opened === true) lesson.lastOpenedAt = new Date();
  
  let newlyCompletedLesson = false;
  if (typeof req.body?.completed === "boolean") {
    if (req.body.completed && !lesson.completedAt) newlyCompletedLesson = true;
    lesson.completedAt = req.body.completed ? new Date() : null;
  }
  if (typeof req.body?.bookmarked === "boolean") {
    lesson.bookmarked = req.body.bookmarked;
  }
  if (typeof req.body?.notes === "string") {
    lesson.notes = req.body.notes.slice(0, 12000);
  }
  
  let newlyCompletedQuiz = false;
  if (typeof req.body?.quizBestScore === "number") {
    lesson.quizBestScore = Math.max(lesson.quizBestScore, req.body.quizBestScore);
  }
  if (typeof req.body?.quizAttempts === "number") {
    if (req.body.quizAttempts > 0) newlyCompletedQuiz = true;
    lesson.quizAttempts += req.body.quizAttempts;
  }

  await lesson.save();

  if (newlyCompletedLesson) {
    await recordActivity(req.user._id, "COMPLETED_LESSON", "Lesson", lesson._id, { title: lesson.title });
  }
  if (newlyCompletedQuiz) {
    await recordActivity(req.user._id, "COMPLETED_QUIZ", "Lesson", lesson._id, { title: lesson.title, score: lesson.quizBestScore });
  }

  // Update user activity streak (fire-and-forget)
  try {
    const today = new Date().toISOString().slice(0, 10);
    const user = await User.findById(req.user._id);
    if (user && user.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      user.studyStreak = user.lastActiveDate === yesterdayStr ? (user.studyStreak || 0) + 1 : 1;
      user.lastActiveDate = today;
      if (!user.activityHistory.includes(today)) {
        user.activityHistory.push(today);
        if (user.activityHistory.length > 365) user.activityHistory = user.activityHistory.slice(-365);
      }
      await user.save();
    }
  } catch (streakErr) {
    console.warn("Streak update failed:", streakErr.message);
  }

  return res.json(lesson.toObject({ depopulate: true }));
}

async function updateSharing(req, res) {
  const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id });
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!ownsCourse(course, req.user._id)) return res.status(403).json({ error: "Forbidden" });

  const wasPublic = course.isPublic;
  course.isPublic = req.body?.enabled === true;
  if (course.isPublic && !course.shareId) course.shareId = crypto.randomUUID();
  await course.save();

  if (!wasPublic && course.isPublic) {
    await recordActivity(req.user._id, "PUBLISHED_COURSE", "Course", course._id, { title: course.title });
  }

  return res.json({ isPublic: course.isPublic, shareId: course.shareId });
}

async function getPublicCourse(req, res) {
  const course = await Course.findOne({
    shareId: req.params.shareId,
    isPublic: true,
  })
    .select("title description modules updatedAt")
    .populate({
      path: "modules",
      select: "title lessons",
      populate: {
        path: "lessons",
        select: "title content language isEnriched",
      },
    })
    .lean();

  if (!course) return res.status(404).json({ error: "Shared course not found" });
  return res.json(course);
}

async function generateFinalTest(req, res) {
  const course = await Course.findOne({ _id: req.params.courseId, creator: req.user._id })
    .populate({
      path: "modules",
      populate: { path: "lessons" }
    });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  if (!ownsCourse(course, req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  if (course.finalTest && course.finalTest.questions && course.finalTest.questions.length > 0) {
    return res.json({ message: "Test already generated", finalTest: course.finalTest });
  }

  const totalLessonsInCourse = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  const TARGET_TOTAL_QUESTIONS = 25;

  const modulePromises = course.modules.map(async (mod, idx) => {
    const lessonCount = mod.lessons?.length || 0;
    if (lessonCount === 0) return [];

    let numQuestions = Math.round((lessonCount / totalLessonsInCourse) * TARGET_TOTAL_QUESTIONS);
    if (numQuestions < 2) numQuestions = 2;

    let moduleSyllabus = `Module ${idx + 1}: ${mod.title}\n`;
    mod.lessons.forEach(l => {
      moduleSyllabus += `- Lesson: ${l.title} (Covers: ${l.description || 'General concepts'})\n`;
    });

    const prompt = `Generate exactly ${numQuestions} multiple-choice questions for the following module from the course "${course.title}".\n\n${moduleSyllabus}\n\nThe difficulty should reflect the advanced topics in the module.`;

    const systemPrompt = `You are an expert educator. Generate a JSON array of multiple-choice questions. Do not output anything else.
Format each item exactly like this:
[
  {
    "question": "What is the primary function of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Option B is correct because..."
  }
]`;

    try {
      let mcqs = await aiRouter.generateJson(systemPrompt, prompt, 4000);
      
      if (mcqs && !Array.isArray(mcqs)) {
        if (Array.isArray(mcqs.questions)) mcqs = mcqs.questions;
        else if (Array.isArray(mcqs.mcqs)) mcqs = mcqs.mcqs;
        else if (Array.isArray(mcqs.data)) mcqs = mcqs.data;
      }
      
      if (!Array.isArray(mcqs)) return [];

      return mcqs
        .filter(q => {
          if (!q || typeof q.question !== 'string' || !Array.isArray(q.options)) return false;
          const ans = Number(q.correctAnswer);
          const validOptionsCount = q.options.filter(opt => String(opt || "").trim()).length;
          return !isNaN(ans) && ans >= 0 && ans < validOptionsCount;
        })
        .map(q => {
          const rawOptions = q.options.map(opt => String(opt || "").trim()).filter(Boolean);
          let correctAnswer = Number(q.correctAnswer);

          const options = [];
          for (let i = 0; i < 4; i++) {
            if (i < rawOptions.length) {
              options.push(rawOptions[i]);
            } else {
              options.push("None of the above");
            }
          }

          if (correctAnswer > 3) {
            options[3] = rawOptions[correctAnswer];
            correctAnswer = 3;
          }

          return {
            question: String(q.question).trim() || "Question",
            options,
            correctAnswer,
            explanation: String(q.explanation || "No explanation provided.").trim()
          };
        });
    } catch (err) {
      console.warn(`Failed to generate questions for module ${mod.title}:`, err);
      return [];
    }
  });

  const results = await Promise.all(modulePromises);
  const finalQuestions = results.flat();

  if (finalQuestions.length < 5) {
    throw new Error("Failed to generate enough questions across modules.");
  }

  finalQuestions.sort(() => Math.random() - 0.5);

  course.finalTest = {
    generatedAt: new Date(),
    questions: finalQuestions
  };
  await course.save();

  res.json({ message: "Test generated successfully", finalTest: course.finalTest });
}

const asyncHandler = require("express-async-handler");

module.exports = {
  deleteCourse: asyncHandler(deleteCourse),
  getCourseById: asyncHandler(getCourseById),
  getLessonView: asyncHandler(getLessonView),
  getMyCourses: asyncHandler(getMyCourses),
  getPublicCourse: asyncHandler(getPublicCourse),
  updateLessonProgress: asyncHandler(updateLessonProgress),
  updateSharing: asyncHandler(updateSharing),
  generateFinalTest: asyncHandler(generateFinalTest),
};
