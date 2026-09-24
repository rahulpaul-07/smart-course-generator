const express = require("express");
const { register, login, refresh, logout, getMe, auth0Sync, googleLogin, demoLogin, authConfig } = require("../controllers/authController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { validateRequest } = require("../middlewares/validateRequest");
const { registerSchema, loginSchema, googleLoginSchema, auth0SyncSchema } = require("../validations/authValidation");
const { authLimiter, demoLimiter } = require("../middlewares/rateLimit");

const router = express.Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

router.get("/config", authConfig);
router.post("/demo", demoLimiter, demoLogin);
router.post("/register", authLimiter, validateRequest(registerSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", authLimiter, refresh);
router.post("/google", authLimiter, validateRequest(googleLoginSchema), googleLogin);

// Protected routes
router.get("/me", verifyAuth0Token, getMe);
router.post("/auth0-sync", verifyAuth0Token, auth0Sync);

module.exports = router;
