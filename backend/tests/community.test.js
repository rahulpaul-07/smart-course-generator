const request = require("supertest");
const app = require("../server");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

describe("Community API", () => {
  let token;
  let userId;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "community@example.com",
      password: "password123",
      name: "Community User"
    });
    token = res.body.token;
    userId = res.body._id;
  });

  describe("GET /api/collab/leaderboard", () => {
    it("should return the leaderboard successfully", async () => {
      const res = await request(app).get("/api/collab/leaderboard");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/collab/templates", () => {
    it("should return public templates", async () => {
      const res = await request(app).get("/api/collab/templates");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /api/collab/templates/:courseId/clone", () => {
    it("should clone a public template course, copying all lessons into the new modules", async () => {
      // Seed a public template course owned by a different user, with two modules
      // and multiple lessons per module.
      const creatorRes = await request(app).post("/api/auth/register").send({
        email: "creator@example.com",
        password: "password123",
        name: "Creator User"
      });
      const creatorId = creatorRes.body._id;

      const templateCourse = await Course.create({
        title: "Community Template",
        description: "A shared template",
        creator: creatorId,
        isPublic: true,
      });

      const moduleA = await Module.create({ title: "Module A", course: templateCourse._id });
      const moduleB = await Module.create({ title: "Module B", course: templateCourse._id });

      const lessonsA = await Lesson.insertMany([
        { title: "A1", module: moduleA._id },
        { title: "A2", module: moduleA._id },
      ]);
      const lessonsB = await Lesson.insertMany([
        { title: "B1", module: moduleB._id },
      ]);

      moduleA.lessons = lessonsA.map((l) => l._id);
      moduleB.lessons = lessonsB.map((l) => l._id);
      await moduleA.save();
      await moduleB.save();

      templateCourse.modules = [moduleA._id, moduleB._id];
      await templateCourse.save();

      const cloneRes = await request(app)
        .post(`/api/collab/templates/${templateCourse._id}/clone`)
        .set("Authorization", `Bearer ${token}`);

      expect(cloneRes.statusCode).toEqual(200);
      expect(cloneRes.body.success).toBe(true);
      expect(cloneRes.body.courseId).toBeDefined();

      const clonedCourse = await Course.findById(cloneRes.body.courseId).populate({
        path: "modules",
        populate: { path: "lessons" },
      });

      expect(String(clonedCourse.creator)).toBe(String(userId));
      expect(clonedCourse.modules).toHaveLength(2);

      const totalClonedLessons = clonedCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      expect(totalClonedLessons).toBe(3);

      const clonedModuleA = clonedCourse.modules.find((m) => m.title === "Module A");
      expect(clonedModuleA.lessons.map((l) => l.title).sort()).toEqual(["A1", "A2"]);
    });

    it("should fail without auth token", async () => {
      const res = await request(app).post("/api/collab/templates/64b8f0c2f1a2b3c4d5e6f7a8/clone");
      expect(res.statusCode).toEqual(401);
    });
  });
});
