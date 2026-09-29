const request = require("supertest");
const app = require("../server");

// The limiters skip themselves when NODE_ENV is "test", so switch it for this
// file to exercise the real per-IP budget (600 requests per 15 minutes).
const realEnv = process.env.NODE_ENV;
let server;
beforeAll(() => {
  process.env.NODE_ENV = "production-like-test";
  server = app.listen(0); // one listener; request(app) would open one per call
});
afterAll((done) => {
  process.env.NODE_ENV = realEnv;
  server.close(done);
});

async function hit(path, times) {
  const statuses = [];
  for (let sent = 0; sent < times; sent += 50) {
    const batch = Array.from({ length: Math.min(50, times - sent) }, () => request(server).get(path));
    statuses.push(...(await Promise.all(batch)).map((res) => res.statusCode));
  }
  return statuses;
}

describe("API rate limit and health probes", () => {
  // Regression: health checks, uptime monitors and the keep-warm job counted
  // against the per-IP API budget, and a load test measured only 429s.
  it("never throttles the liveness probe", async () => {
    const statuses = await hit("/api/health/liveness", 650);
    expect(statuses.filter((s) => s !== 200)).toEqual([]);
  });

  it("still throttles the rest of the API past its budget", async () => {
    const statuses = await hit("/api/unknown", 610);
    expect(statuses.filter((s) => s === 404)).toHaveLength(600);
    expect(statuses.filter((s) => s === 429)).toHaveLength(10);
  });
});
