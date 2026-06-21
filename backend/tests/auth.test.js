const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should fail validation if fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        email: "testlogin@example.com",
        password: "password123",
        name: "Test Login"
      });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testlogin@example.com",
        password: "password123"
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
    });

    it("should fail login with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testlogin@example.com",
        password: "wrongpassword"
      });
      expect(res.statusCode).toEqual(401);
    });
  });
});
