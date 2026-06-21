const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(254),
    password: z.string().min(6, "Password must be at least 6 characters").max(128)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
  })
});

const googleLoginSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required")
  })
});

const auth0SyncSchema = z.object({
  body: z.object({
    auth0Id: z.string().min(1, "Auth0 ID is required"),
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    picture: z.string().url().optional().or(z.literal(''))
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  auth0SyncSchema
};
