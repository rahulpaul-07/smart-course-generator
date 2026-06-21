const express = require("express");
const { toggleBookmark, getBookmarks, checkBookmark, updateOnboarding, updateProfile, updateSettings } = require("../controllers/userController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { validateRequest } = require("../middlewares/validateRequest");
const { updateProfileSchema, updateSettingsSchema, finishOnboardingSchema } = require("../validations/userValidation");

const router = express.Router();

router.use(verifyAuth0Token);

router.get("/bookmarks", getBookmarks);
router.get("/bookmarks/:lessonId", checkBookmark);
router.post("/bookmarks/:lessonId", toggleBookmark);

router.put("/onboarding", validateRequest(finishOnboardingSchema), updateOnboarding);
router.put("/profile", validateRequest(updateProfileSchema), updateProfile);
router.put("/settings", validateRequest(updateSettingsSchema), updateSettings);

module.exports = router;
