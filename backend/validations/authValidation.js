const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
    password: z.string().min(8, "Password must be at least 8 characters").max(128)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
    password: z.string().min(1, "Password is required")
  })
});

const googleLoginSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required")
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  googleLoginSchema
};
