const { Router } = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");

const router = Router();
const validateObjectIds = require("../middlewares/validateObjectIds");
router.use(validateObjectIds);

router.get("/summary", verifyAuth0Token, getDashboardSummary);

module.exports = router;

