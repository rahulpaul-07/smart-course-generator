const rateLimit = require("express-rate-limit");

// Rate limiting uses a shared in-memory counter; during the test run all
// requests share one IP, so leaving it on would 429 the suite. Disable in test.
const skipInTest = () => process.env.NODE_ENV === "test";

const createErrorResponse = (message) => ({
  success: false,
  error: {
    message,
    code: "RATE_LIMIT_EXCEEDED"
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // A single dashboard load fans out to ~8 queries, so 100/15min locked out
  // ordinary users after a few minutes of clicking around.
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("Too many requests from this IP, please try again after 15 minutes.")
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  // Counts only failed attempts, so a user who logs in and out on several
  // devices is not locked out for an hour.
  max: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("Too many authentication attempts, please try again after an hour.")
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI generation requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("AI generation rate limit exceeded. Please try again later.")
});

const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit community endpoints
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("Too many community interactions, please try again later.")
});

// Each demo login creates a user and clones a course, so it is capped per IP.
const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("Too many demo sessions from this network. Please sign up instead."),
});

module.exports = { apiLimiter, authLimiter, aiLimiter, communityLimiter, demoLimiter };
