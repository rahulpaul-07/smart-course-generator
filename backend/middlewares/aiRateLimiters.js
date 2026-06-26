const rateLimit = require("express-rate-limit");

const createAiLimiter = (maxRequests, windowMs = 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: { error: "Too many AI requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const courseGenLimiter = createAiLimiter(5);
const lessonEnrichLimiter = createAiLimiter(10);
const askAiLimiter = createAiLimiter(30);
const interviewGenLimiter = createAiLimiter(5);
const roadmapGenLimiter = createAiLimiter(10);
const practiceLabLimiter = createAiLimiter(10);

module.exports = {
  courseGenLimiter,
  lessonEnrichLimiter,
  askAiLimiter,
  interviewGenLimiter,
  roadmapGenLimiter,
  practiceLabLimiter
};
