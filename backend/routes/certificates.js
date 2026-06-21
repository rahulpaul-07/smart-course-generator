const express = require('express');
const router = express.Router();
const { verifyAuth0Token } = require('../middlewares/auth0Auth');
const certificateController = require('../controllers/certificateController');

// Public route to view certificate
router.get('/:certificateId', certificateController.getCertificate);

// Protected route to claim certificate
router.post('/claim/:courseId', verifyAuth0Token, certificateController.claimCertificate);

module.exports = router;
