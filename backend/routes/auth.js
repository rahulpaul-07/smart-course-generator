const express = require("express");
const { register, login, refresh, logout, getMe, auth0Sync, googleLogin, demoLogin, authConfig, claimGuest } = require("../controllers/authController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { validateRequest } = require("../middlewares/validateRequest");
const { registerSchema, loginSchema, googleLoginSchema } = require("../validations/authValidation");
const { authLimiter, loginAccountLimiter, demoLimiter, demoGlobalLimiter } = require("../middlewares/rateLimit");

const router = express.Router();

router.get("/config", authConfig);
router.post("/demo", demoLimiter, demoGlobalLimiter, demoLogin);
router.post("/register", authLimiter, validateRequest(registerSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), loginAccountLimiter, login);
router.post("/logout", logout);
router.post("/refresh", authLimiter, refresh);
router.post("/google", authLimiter, validateRequest(googleLoginSchema), googleLogin);

// Protected routes
router.get("/me", verifyAuth0Token, getMe);
router.post("/auth0-sync", verifyAuth0Token, auth0Sync);
router.post("/claim", authLimiter, verifyAuth0Token, validateRequest(registerSchema), claimGuest);

module.exports = router;
