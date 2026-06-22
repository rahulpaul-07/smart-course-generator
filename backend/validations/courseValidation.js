const { z } = require("zod");

const generateCourseSchema = z.object({
  body: z.object({
    prompt: z.string().min(10, "Describe the course in at least 10 characters").max(2000),
    language: z.string().default('English')
  })
});

const generateLessonSchema = z.object({
  params: z.object({
    lessonId: z.string().length(24, "Invalid Lesson ID")
  })
});

module.exports = {
  generateCourseSchema,
  generateLessonSchema
};
