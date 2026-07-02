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

module.exports = router;



