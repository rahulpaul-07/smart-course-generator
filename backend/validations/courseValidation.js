const { z } = require("zod");

const generateCourseSchema = z.object({
  body: z.object({
    prompt: z.string().min(10, "Describe the course in at least 10 characters").max(2000),
    language: z.string().default('English')
  })
});

module.exports = {
  generateCourseSchema
};
