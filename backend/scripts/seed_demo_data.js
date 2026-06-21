const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/unified-course";

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("Wiping existing demo data...");
    await User.deleteMany({ email: { $regex: /@demo.com$/ } });
    await Course.deleteMany({ isFeatured: true });

    console.log("Creating demo users...");
    const alice = await User.create({
      name: "Alice Engineer",
      email: "alice@demo.com",
      auth0Id: "auth0|demo1",
      role: "admin",
      bio: "Senior Backend Engineer at TechCorp. I love building scalable systems.",
      isProfilePublic: true,
      studyStreak: 14,
      totalStudyMinutes: 2450
    });

    const bob = await User.create({
      name: "Bob Developer",
      email: "bob@demo.com",
      auth0Id: "auth0|demo2",
      role: "user",
      bio: "Fullstack Developer transitioning into AI engineering.",
      isProfilePublic: true,
      studyStreak: 5,
      totalStudyMinutes: 800,
      activityHistory: [
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]
    });

    console.log("Creating featured community templates...");
    const course1 = await Course.create({
      title: "Mastering Distributed Systems in Node.js",
      description: "A comprehensive guide to message queues, microservices, and horizontal scaling.",
      isPublic: true,
      isFeatured: true,
      clonesCount: 1420,
      upvotesCount: 890,
      creator: alice._id,
      modules: []
    });

    const course2 = await Course.create({
      title: "React 18 Concurrent Features Deep Dive",
      description: "Learn how to utilize Suspense, useTransition, and useDeferredValue.",
      isPublic: true,
      isFeatured: true,
      clonesCount: 850,
      upvotesCount: 512,
      creator: bob._id,
      modules: []
    });

    console.log("Creating certificates...");
    const Certificate = require("../models/Certificate");
    await Certificate.deleteMany({});
    await Certificate.create({
      user: bob._id,
      course: course2._id,
      certificateId: "CERT-DEMO-REACT-18",
      issuedAt: new Date(),
      courseTitle: course2.title,
      userName: bob.name,
      averageScore: 92
    });

    console.log("Creating Roadmaps & Interviews...");
    // Mock Roadmap
    const Roadmap = mongoose.model("Roadmap", new mongoose.Schema({}, { strict: false }));
    await Roadmap.deleteMany({});
    await Roadmap.create({
      user: bob._id,
      goal: "Backend Engineer",
      duration: "12 weeks",
      skillLevel: "Intermediate",
      weeks: [{ week: 1, topic: "Node.js Basics" }, { week: 2, topic: "Express & Middleware" }],
      createdAt: new Date()
    });

    // Mock Interview
    const Interview = mongoose.model("Interview", new mongoose.Schema({}, { strict: false }));
    await Interview.deleteMany({});
    await Interview.create({
      user: alice._id,
      topic: "System Design",
      score: 95,
      feedback: "Excellent understanding of horizontal scaling.",
      createdAt: new Date()
    });

    console.log("✅ Demo data seeded successfully. Ready for screenshots!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
