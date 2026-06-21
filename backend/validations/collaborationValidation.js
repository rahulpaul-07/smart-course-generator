const { z } = require("zod");

const rateTemplateSchema = z.object({
  params: z.object({
    courseId: z.string().length(24, "Invalid Course ID")
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5)
  })
});

const cloneTemplateSchema = z.object({
  params: z.object({
    courseId: z.string().length(24, "Invalid Course ID")
  })
});

module.exports = {
  rateTemplateSchema,
  cloneTemplateSchema
};
