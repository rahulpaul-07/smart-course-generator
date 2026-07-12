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
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: createErrorResponse("Too many requests from this IP, please try again after 15 minutes.")
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register requests per hour
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

module.exports = { apiLimiter, authLimiter, aiLimiter, communityLimiter };
