const { Router } = require("express");
const { generateCourseContent, generateCourseContentStream, enrichLessonStream, enrichLesson, generateFlashcards, generatePracticeLab, chatAboutLesson, clearLessonChat, chatAboutCourse, generateLessonOutline, generateLessonChunk, generateLessonQuizChunk, addVideosToLesson } = require("../../controllers/courseAiController");
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
const { courseGenLimiter, lessonEnrichLimiter, practiceLabLimiter, askAiLimiter } = require("../../middlewares/aiRateLimiters");
const validateObjectIds = require("../../middlewares/validateObjectIds");
router.use(validateObjectIds);

router.use(verifyAuth0Token); // Ensure user is authenticated via Auth0

router.post("/generate", courseGenLimiter, aiLimiter, validateRequest(generateCourseSchema), generateCourseContent);
router.post("/generate-stream", courseGenLimiter, aiLimiter, validateRequest(generateCourseSchema), generateCourseContentStream);
router.get("/mine", getMyCourses);
router.post("/:courseId/chat", askAiLimiter, aiLimiter, chatAboutCourse);

router.get("/:courseId/lessons/:lessonId", getLessonView);
router.post("/:courseId/lessons/:lessonId/generate/outline", aiLimiter, generateLessonOutline);
router.post("/:courseId/lessons/:lessonId/generate/chunk", aiLimiter, generateLessonChunk);
router.post("/:courseId/lessons/:lessonId/generate/quiz", aiLimiter, generateLessonQuizChunk);

router.post("/:courseId/lessons/:lessonId/enrich", lessonEnrichLimiter, aiLimiter, enrichLesson);
router.post("/:courseId/lessons/:lessonId/add-videos", aiLimiter, addVideosToLesson);
router.post("/:courseId/generate-test", aiLimiter, generateFinalTest);
router.post("/:courseId/lessons/:lessonId/enrich-stream", lessonEnrichLimiter, aiLimiter, enrichLessonStream);
router.post("/:courseId/lessons/:lessonId/flashcards", aiLimiter, generateFlashcards);
router.post("/:courseId/lessons/:lessonId/lab", practiceLabLimiter, aiLimiter, generatePracticeLab);
router.post("/:courseId/lessons/:lessonId/chat", askAiLimiter, aiLimiter, chatAboutLesson);
router.delete("/:courseId/lessons/:lessonId/chat", clearLessonChat);
router.put("/:courseId/lessons/:lessonId/progress", updateLessonProgress);
router.patch("/lessons/:lessonId/progress", updateLessonProgress);
router.patch("/:courseId/sharing", updateSharing);

router.route("/:courseId")
  .get(getCourseById)
  .delete(deleteCourse);

module.exports = router;

