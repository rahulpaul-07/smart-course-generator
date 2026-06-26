const express = require('express');
const router = express.Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);
const { verifyAuth0Token } = require('../middlewares/auth0Auth');
const certificateController = require('../controllers/certificateController');

// Public route to view certificate
router.get('/:certificateId', certificateController.getCertificate);

// Protected route to claim certificate
router.post('/claim/:courseId', verifyAuth0Token, certificateController.claimCertificate);

// Protected route to get user's certificates
router.get('/mine/all', verifyAuth0Token, certificateController.getMyCertificates);

module.exports = router;
