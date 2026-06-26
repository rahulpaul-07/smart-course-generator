const express = require("express");
const { register, login, logout, getMe, auth0Sync, googleLogin } = require("../controllers/authController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { validateRequest } = require("../middlewares/validateRequest");
const { registerSchema, loginSchema, googleLoginSchema, auth0SyncSchema } = require("../validations/authValidation");
const { authLimiter } = require("../middlewares/rateLimit");

const router = express.Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

router.post("/register", authLimiter, validateRequest(registerSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", logout);
router.post("/google", authLimiter, validateRequest(googleLoginSchema), googleLogin);

// Protected routes
router.get("/me", verifyAuth0Token, getMe);
router.post("/auth0-sync", verifyAuth0Token, auth0Sync);

module.exports = router;
