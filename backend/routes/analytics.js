const express = require("express");
const router = express.Router();
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { getDashboard, recordStudyTime } = require("../controllers/analyticsController");

router.use(verifyAuth0Token);

router.get("/dashboard", getDashboard);
router.post("/study-time", recordStudyTime);

module.exports = router;
