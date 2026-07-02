const request = require("supertest");
const app = require("../server");

describe("Health API", () => {
  it("should return a 200 OK for the health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Backend health check successful");
  });

  it("should return a 404 for unknown endpoints", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.statusCode).toEqual(404);
    expect(res.body.error.message).toMatch(/Not Found/);
  });
});
