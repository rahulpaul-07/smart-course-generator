const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("Analytics API", () => {
  let token;

  beforeEach(async () => {
    // Create a user and get token
    const res = await request(app).post("/api/auth/register").send({
      email: "analytics@example.com",
      password: "password123",
      name: "Analytics User"
    });
    token = res.body.token;
  });

  describe("GET /api/analytics/dashboard", () => {
    it("should return the analytics dashboard successfully", async () => {
      const res = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("totalXP");
      expect(res.body).toHaveProperty("currentStreak");
    });

    it("should fail without auth token", async () => {
      const res = await request(app).get("/api/analytics/dashboard");
      expect(res.statusCode).toEqual(401);
    });
  });
});
