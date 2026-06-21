const { Router } = require("express");
const { generateCourseContent, enrichLessonStream, enrichLesson, generateFlashcards, generatePracticeLab, chatAboutLesson, chatAboutCourse, generateLessonOutline, generateLessonChunk, generateLessonQuizChunk } = require("../../controllers/courseAiController");
const {
  deleteCourse,
  getCourseById,
  getLessonView,
  getMyCourses,
  updateSharing,
  updateLessonProgress,
  generateFinalTest
} = require("../../controllers/courseController");
const { verifyAuth0Token } = require("../../middlewares/auth0Auth");
const { validateRequest } = require("../../middlewares/validateRequest");
const { generateCourseSchema, generateLessonSchema } = require("../../validations/courseValidation");
const { aiLimiter } = require("../../middlewares/rateLimit");

const router = Router();

router.use(verifyAuth0Token); // Ensure user is authenticated via Auth0

router.post("/generate", aiLimiter, validateRequest(generateCourseSchema), generateCourseContent);
router.get("/mine", getMyCourses);
router.post("/:courseId/chat", aiLimiter, chatAboutCourse);

router.get("/:courseId/lessons/:lessonId", getLessonView);
router.post("/:courseId/lessons/:lessonId/generate/outline", aiLimiter, generateLessonOutline);
router.post("/:courseId/lessons/:lessonId/generate/chunk", aiLimiter, generateLessonChunk);
router.post("/:courseId/lessons/:lessonId/generate/quiz", aiLimiter, generateLessonQuizChunk);

router.post("/:courseId/lessons/:lessonId/enrich", aiLimiter, enrichLesson);
router.post("/:courseId/generate-test", aiLimiter, generateFinalTest);
router.post("/:courseId/lessons/:lessonId/enrich-stream", aiLimiter, enrichLessonStream);
router.post("/:courseId/lessons/:lessonId/flashcards", aiLimiter, generateFlashcards);
router.post("/:courseId/lessons/:lessonId/lab", aiLimiter, generatePracticeLab);
router.post("/:courseId/lessons/:lessonId/chat", aiLimiter, chatAboutLesson);
router.put("/:courseId/lessons/:lessonId/progress", updateLessonProgress);
router.patch("/lessons/:lessonId/progress", updateLessonProgress);
router.patch("/:courseId/sharing", updateSharing);

router.route("/:courseId")
  .get(getCourseById)
  .delete(deleteCourse);

module.exports = router;
