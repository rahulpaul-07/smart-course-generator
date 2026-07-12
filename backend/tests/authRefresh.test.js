const request = require("supertest");
const app = require("../server");

// Integration test for the refresh-token rotation flow. Runs in CI where an
// in-memory MongoDB is available (see tests/setup.js).
describe("Refresh token flow", () => {
  const creds = { name: "Refresh User", email: "refresh@example.com", password: "password123" };

  it("issues a refresh cookie on register and rotates it on /refresh", async () => {
    const agent = request.agent(app);
    const reg = await agent.post("/api/auth/register").send(creds);
    expect(reg.statusCode).toBe(201);
    expect(reg.body.token).toBeTruthy();

    const setCookie = reg.headers["set-cookie"].join(";");
    expect(setCookie).toMatch(/refreshToken=/);
    expect(setCookie).toMatch(/HttpOnly/i);

    const refreshed = await agent.post("/api/auth/refresh").send();
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.body.token).toBeTruthy();
    expect(refreshed.body.email).toBe(creds.email);
  });

  it("revokes the refresh token on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send({ ...creds, email: "revoke@example.com" });

    const logout = await agent.post("/api/auth/logout").send();
    expect(logout.statusCode).toBe(200);

    const afterLogout = await agent.post("/api/auth/refresh").send();
    expect(afterLogout.statusCode).toBe(401);
  });

  it("rejects /refresh with no cookie", async () => {
    const res = await request(app).post("/api/auth/refresh").send();
    expect(res.statusCode).toBe(401);
  });
});
