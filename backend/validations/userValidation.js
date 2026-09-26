const { z } = require("zod");

const MAX_INTERESTS = 20;
const interest = z.string().trim().min(1).max(60);

// Avatars render on public pages, so only https images: no data:, no
// javascript:, no plain-http mixed content.
const avatarUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Invalid avatar URL")
  .refine((value) => value.startsWith("https://"), "Avatar URL must use https");

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    bio: z.string().max(500).optional(),
    isProfilePublic: z.boolean().optional(),
    avatar: avatarUrl.optional().or(z.literal('')),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    learningInterests: z.array(interest).max(MAX_INTERESTS).optional()
  })
});

const updateSettingsSchema = z.object({
  body: z.object({
    theme: z.enum(['dark', 'light', 'system']).optional()
  })
});

const finishOnboardingSchema = z.object({
  body: z.object({
    learningInterests: z.array(interest).min(1, "At least one interest is required").max(MAX_INTERESTS),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
  })
});

module.exports = {
  updateProfileSchema,
  finishOnboardingSchema,
  updateSettingsSchema
};
