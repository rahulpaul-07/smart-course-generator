const request = require("supertest");
const app = require("../server");

describe("Analytics API", () => {
  let token;

  beforeEach(async () => {
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
      expect(res.body).toHaveProperty("xp");
      expect(res.body).toHaveProperty("studyStreak");
      expect(res.body).toHaveProperty("totalCourses");
      expect(res.body).toHaveProperty("courseStats");
    });

    it("should fail without auth token", async () => {
      const res = await request(app).get("/api/analytics/dashboard");
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("POST /api/analytics/study-time", () => {
    it("should record study time and return updated totals", async () => {
      const res = await request(app)
        .post("/api/analytics/study-time")
        .set("Authorization", `Bearer ${token}`)
        .send({ minutes: 5 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.totalStudyMinutes).toBeGreaterThanOrEqual(5);
      expect(res.body.studyStreak).toBeGreaterThanOrEqual(1);
    });
  });
});
