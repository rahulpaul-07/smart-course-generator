const { z } = require("zod");

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
    bio: z.string().max(500).optional(),
    isProfilePublic: z.boolean().optional(),
    avatar: z.string().url("Invalid avatar URL").optional().or(z.literal(''))
  })
});

const updateSettingsSchema = z.object({
  body: z.object({
    theme: z.enum(['dark', 'light', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional()
    }).optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(128)
  })
});

const finishOnboardingSchema = z.object({
  body: z.object({
    learningInterests: z.array(z.string()).min(1, "At least one interest is required"),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'])
  })
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  finishOnboardingSchema,
  updateSettingsSchema
};
