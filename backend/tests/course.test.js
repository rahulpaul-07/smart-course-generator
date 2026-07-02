const request = require("supertest");
const app = require("../server");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

describe("Course API", () => {
  let token;
  let userId;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "courseuser@example.com",
      password: "password123",
      name: "Course User"
    });
    token = res.body.token;
    userId = res.body._id;
  });

  describe("GET /api/courses/mine", () => {
    it("should return empty array when user has no courses", async () => {
      const res = await request(app)
        .get("/api/courses/mine")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it("should fail without auth token", async () => {
      const res = await request(app).get("/api/courses/mine");
      expect(res.statusCode).toEqual(401);
    });

    it("should return the user's courses with populated modules and lessons", async () => {
      const course = await Course.create({
        title: "Intro to Testing",
        description: "A test course",
        creator: userId,
      });
      const module = await Module.create({ title: "Module 1", course: course._id });
      const lesson = await Lesson.create({ title: "Lesson 1", module: module._id });
      module.lessons = [lesson._id];
      await module.save();
      course.modules = [module._id];
      await course.save();

      const res = await request(app)
        .get("/api/courses/mine")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Intro to Testing");
      expect(res.body[0].modules).toHaveLength(1);
      expect(res.body[0].modules[0].lessons).toHaveLength(1);
      expect(res.body[0].modules[0].lessons[0].title).toBe("Lesson 1");
    });
  });

  describe("GET /api/courses/:courseId", () => {
    it("should return 404 for a course that does not exist", async () => {
      const res = await request(app)
        .get("/api/courses/64b8f0c2f1a2b3c4d5e6f7a8")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("POST /api/courses/generate", () => {
    it("should fail validation if prompt is missing", async () => {
      const res = await request(app)
        .post("/api/courses/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({ language: "English" });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should fail without auth token", async () => {
      const res = await request(app)
        .post("/api/courses/generate")
        .send({ prompt: "A course about testing Node.js applications" });
      expect(res.statusCode).toEqual(401);
    });
  });
});
