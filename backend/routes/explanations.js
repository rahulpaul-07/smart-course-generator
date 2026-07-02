// backend/routes/explanations.js

const express = require('express');
const router = express.Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

// Controllers
const explanationsController = require('../controllers/explanationsController');
const { verifyAuth0Token } = require('../middlewares/auth0Auth');
const { aiLimiter } = require('../middlewares/rateLimit');

router.use(verifyAuth0Token);

router.post('/hinglish-text', aiLimiter, explanationsController.getHinglishText);
router.post('/hinglish-audio', aiLimiter, explanationsController.getHinglishAudio);

module.exports = router;
