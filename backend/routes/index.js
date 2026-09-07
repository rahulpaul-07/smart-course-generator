const { Router } = require("express");
const courseRoutes = require("./courses/courseRoutes");
const userRoutes = require("./user");
const explanationsRoutes = require("./explanations");
const certificateRoutes = require("./certificates");
const authRoutes = require("./auth");
const analyticsRoutes = require("./analytics");
const roadmapRoutes = require("./roadmaps");
const interviewRoutes = require("./interviews");
const agentRoutes = require("./agents");
const collaborationRoutes = require("./collaboration");
const dashboardRoutes = require("./dashboard");
const { getHealth } = require("../controllers/healthController");
const { getAiStatus } = require("../controllers/aiStatusController");
const { getEvalReport } = require("../controllers/evalsController");
const { getPublicCourse } = require("../controllers/courseController");

const router = Router();

router.get("/public/courses/:shareId", getPublicCourse);

router.use("/dashboard", dashboardRoutes);
router.use("/courses", courseRoutes);
router.use("/user", userRoutes);
router.use("/explanations", explanationsRoutes);
router.use("/certificates", certificateRoutes);
router.use("/auth", authRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/roadmaps", roadmapRoutes);
router.use("/interviews", interviewRoutes);
router.use("/agents", agentRoutes);
router.use("/collab", collaborationRoutes);
router.get("/health", getHealth);
// Public read-only view of the AI router: provider chain, circuit-breaker
// state and recent success/latency. Exposes no keys and no prompt content.
router.get("/ai/status", getAiStatus);
// Read-only view of the committed eval scorecard (evals/report.md). Reports
// the last recorded run; it never triggers one.
router.get("/evals/report", getEvalReport);

module.exports = router;



