const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

describe.skip("Course API", () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a user and get token
    const res = await request(app).post("/api/auth/register").send({
      email: "courseuser@example.com",
      password: "password123",
      name: "Course User"
    });
    token = res.body.token;
    userId = res.body.user._id;
  });

  describe("GET /api/courses", () => {
    it("should return empty array when user has no courses", async () => {
      const res = await request(app)
        .get("/api/courses")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it("should fail without auth token", async () => {
      const res = await request(app).get("/api/courses");
      expect(res.statusCode).toEqual(401);
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
  });
});
