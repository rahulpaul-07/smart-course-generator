const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("Community API", () => {
  let token;

  beforeEach(async () => {
    // Create a user and get token
    const res = await request(app).post("/api/auth/register").send({
      email: "community@example.com",
      password: "password123",
      name: "Community User"
    });
    token = res.body.token;
  });

  describe("GET /api/collaboration/leaderboard", () => {
    it("should return the leaderboard successfully", async () => {
      const res = await request(app).get("/api/collaboration/leaderboard");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/collaboration/templates", () => {
    it("should return public templates", async () => {
      const res = await request(app).get("/api/collaboration/templates");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("courses");
      expect(res.body).toHaveProperty("total");
    });
  });
});
