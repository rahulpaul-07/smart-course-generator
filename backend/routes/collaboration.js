const { Router } = require("express");
const { getUserProfile, updateUserProfile, getLeaderboard, getCommunityTemplates, getMyUpvotedTemplateIds, upvoteTemplate, getPublicProfile, rateTemplate, cloneTemplate, getActivityFeed } = require("../controllers/collaborationController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { validateRequest } = require("../middlewares/validateRequest");
const { rateTemplateSchema, cloneTemplateSchema } = require("../validations/collaborationValidation");
const { communityLimiter } = require("../middlewares/rateLimit");
const { cacheMiddleware } = require("../middlewares/cacheMiddleware");

const router = Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

// Public routes
router.get("/leaderboard", communityLimiter, cacheMiddleware(60), getLeaderboard);
router.get("/templates", communityLimiter, cacheMiddleware(60), getCommunityTemplates);
router.get("/profile/:userId", communityLimiter, cacheMiddleware(60), getPublicProfile);
router.get("/activity", communityLimiter, cacheMiddleware(30), getActivityFeed);

// Protected routes
router.use(verifyAuth0Token);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/templates/my-upvotes", getMyUpvotedTemplateIds);
router.post("/templates/:courseId/upvote", communityLimiter, upvoteTemplate);
router.post("/templates/:courseId/rate", communityLimiter, validateRequest(rateTemplateSchema), rateTemplate);
router.post("/templates/:courseId/clone", communityLimiter, validateRequest(cloneTemplateSchema), cloneTemplate);

module.exports = router;

