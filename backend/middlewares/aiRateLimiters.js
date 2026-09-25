const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/**
 * AI calls spend shared provider quota, so they are budgeted per *account*
 * when the caller is signed in (these limiters sit after verifyAuth0Token).
 * Keyed by IP, everyone behind one campus NAT shared a single budget while one
 * user hopping networks had none.
 */
const aiKey = (req) => (req.user?._id ? `user:${req.user._id}` : ipKeyGenerator(req.ip));

const createAiLimiter = (maxRequests, windowMs = 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: aiKey,
    skip: () => process.env.NODE_ENV === "test",
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
// These four endpoints called the LLM with no limit at all.
const agentLimiter = createAiLimiter(10);
const interviewAnswerLimiter = createAiLimiter(20);

module.exports = {
  courseGenLimiter,
  lessonEnrichLimiter,
  askAiLimiter,
  interviewGenLimiter,
  roadmapGenLimiter,
  practiceLabLimiter,
  agentLimiter,
  interviewAnswerLimiter,
  aiKey,
};
