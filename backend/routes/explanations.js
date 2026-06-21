// backend/routes/explanations.js

const express = require('express');
const router = express.Router();

// Controllers
const explanationsController = require('../controllers/explanationsController');

// NOTE: For demo purposes these routes are public. In production you would protect them with verifyAuth0Token.
router.post('/hinglish-text', explanationsController.getHinglishText);
router.post('/hinglish-audio', explanationsController.getHinglishAudio);

module.exports = router;
