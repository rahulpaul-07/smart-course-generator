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

    it("should generate a course with a difficulty and skills, falling back sanely when the AI omits them", async () => {
      const res = await request(app)
        .post("/api/courses/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({ prompt: "A beginner course about JSON fundamentals" });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBeDefined();
      expect(res.body.modules.length).toBeGreaterThan(0);
      // The mock AI response used in test/no-key mode omits difficulty/skills,
      // so persistence must fall back sanely rather than leaving them unset.
      expect(res.body.difficulty).toBe("Intermediate");
      expect(Array.isArray(res.body.skills)).toBe(true);

      const saved = await Course.findById(res.body._id);
      expect(saved.difficulty).toBe("Intermediate");
      expect(Array.isArray(saved.skills)).toBe(true);
    });
  });

  describe("POST /api/courses/generate-stream", () => {
    it("should fail without auth token", async () => {
      const res = await request(app)
        .post("/api/courses/generate-stream")
        .send({ prompt: "A course about testing Node.js applications" });
      expect(res.statusCode).toEqual(401);
    });

    it("should fail validation with a plain JSON error (no SSE headers) if prompt is too short", async () => {
      const res = await request(app)
        .post("/api/courses/generate-stream")
        .set("Authorization", `Bearer ${token}`)
        .send({ prompt: "short" });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
      expect(res.headers["content-type"]).not.toMatch(/event-stream/);
    });

    it("should stream named stage events and a final done event with the persisted course", async () => {
      const res = await request(app)
        .post("/api/courses/generate-stream")
        .set("Authorization", `Bearer ${token}`)
        .send({ prompt: "A beginner course about JSON fundamentals" });

      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toMatch(/text\/event-stream/);

      const body = res.text;
      expect(body).toContain("event: stage");
      expect(body).toContain('"stage":"analyzing_topic"');
      expect(body).toContain('"stage":"designing_curriculum"');
      expect(body).toContain('"stage":"saving_course"');
      expect(body).toContain('"stage":"ready"');
      expect(body).toContain("event: done");

      const doneLine = body.split("\n").find((line) => line.startsWith("data: ") && line.includes('"modules"'));
      expect(doneLine).toBeDefined();
      const course = JSON.parse(doneLine.slice(6));
      expect(course.title).toBeDefined();
      expect(course.modules.length).toBeGreaterThan(0);
      expect(course.difficulty).toBe("Intermediate");
      expect(Array.isArray(course.skills)).toBe(true);

      const saved = await Course.findById(course._id);
      expect(saved).not.toBeNull();
      expect(saved.difficulty).toBe("Intermediate");
    });
  });
});
