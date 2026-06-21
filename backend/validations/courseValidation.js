const { z } = require("zod");

const generateCourseSchema = z.object({
  body: z.object({
    topic: z.string().min(2, "Topic must be at least 2 characters").max(100),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    modulesCount: z.number().int().min(1).max(10).default(3),
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
