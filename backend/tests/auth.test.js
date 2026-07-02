const request = require("supertest");
const app = require("../server");

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
      expect(res.body._id).toBeDefined();
      expect(res.body.email).toBe("test@example.com");
    });

    it("should fail when registering a duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        email: "dupe@example.com",
        password: "password123",
        name: "Original User"
      });
      const res = await request(app).post("/api/auth/register").send({
        email: "dupe@example.com",
        password: "password123",
        name: "Duplicate User"
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
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
      expect(res.body._id).toBeDefined();
    });

    it("should fail login with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testlogin@example.com",
        password: "wrongpassword"
      });
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should fail without a token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toEqual(401);
    });

    it("should return the current user with a valid token", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        email: "me@example.com",
        password: "password123",
        name: "Me User"
      });
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${registerRes.body.token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBe("me@example.com");
    });
  });
});
