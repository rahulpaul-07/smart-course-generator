/**
 * Regression tests for the submission-readiness audit: authorization status
 * codes, ObjectId validation, the refresh-token session model, certificate
 * integrity and guest-account limits.
 */
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const RefreshToken = require("../models/RefreshToken");

async function register(email, agent = request(app)) {
  const res = await agent.post("/api/auth/register").send({ email, password: "password123", name: "Audit User" });
  return { token: res.body.token, id: res.body._id, res };
}

async function seedCourse(creator, extra = {}) {
  const course = await Course.create({ title: "Private course", creator, ...extra });
  const mod = await Module.create({ course: course._id, title: "M1" });
  const lesson = await Lesson.create({ module: mod._id, title: "L1" });
  mod.lessons = [lesson._id];
  await mod.save();
  course.modules = [mod._id];
  await course.save();
  return { course, lesson };
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

function refreshCookie(res) {
  return (res.headers["set-cookie"] || []).find((c) => c.startsWith("refreshToken="));
}

describe("authorization failures use their real status codes", () => {
  it("returns 403, not 500, when reading or updating another user's lesson", async () => {
    const owner = await register("owner@example.com");
    const other = await register("other@example.com");
    const { course, lesson } = await seedCourse(owner.id);

    const view = await request(app).get(`/api/courses/${course._id}/lessons/${lesson._id}`).set(bearer(other.token));
    expect(view.statusCode).toBe(403);
    expect(view.body.error.code).toBe("FORBIDDEN");

    const progress = await request(app)
      .put(`/api/courses/${course._id}/lessons/${lesson._id}/progress`)
      .set(bearer(other.token))
      .send({ completed: true });
    expect(progress.statusCode).toBe(403);
    expect((await Lesson.findById(lesson._id).lean()).completedAt).toBeNull();
  });

  it("returns 404 for a lesson that does not exist", async () => {
    const user = await register("missing@example.com");
    const { course } = await seedCourse(user.id);
    const res = await request(app)
      .get(`/api/courses/${course._id}/lessons/${new Course()._id}`)
      .set(bearer(user.token));
    expect(res.statusCode).toBe(404);
  });
});

describe("ObjectId route params", () => {
  it.each([
    ["/api/courses/not-an-id", "courseId"],
    ["/api/user/bookmarks/not-an-id", "lessonId"],
    ["/api/roadmaps/not-an-id", "id"],
  ])("rejects a malformed id on %s with 400", async (path, param) => {
    const user = await register(`ids-${param}@example.com`);
    const res = await request(app).get(path).set(bearer(user.token));
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe(`Invalid ${param}.`);
  });

  it("validates public routes too", async () => {
    const res = await request(app).get("/api/collab/profile/not-an-id");
    expect(res.statusCode).toBe(400);
  });
});

describe("session tokens", () => {
  it("issues only a Strict, /api/auth-scoped refresh cookie and no access-token cookie", async () => {
    const { res } = await register("cookie@example.com");
    const cookies = res.headers["set-cookie"] || [];
    const refresh = refreshCookie(res);

    expect(refresh).toMatch(/HttpOnly/i);
    expect(refresh).toMatch(/SameSite=Strict/i);
    expect(refresh).toMatch(/Path=\/api\/auth/);
    expect(cookies.some((c) => c.startsWith("token="))).toBe(false);
  });

  it("does not authenticate from a cookie, only from a Bearer header", async () => {
    const { token } = await register("bearer-only@example.com");
    const cookieOnly = await request(app).get("/api/auth/me").set("Cookie", `token=${token}`);
    expect(cookieOnly.statusCode).toBe(401);

    const withBearer = await request(app).get("/api/auth/me").set(bearer(token));
    expect(withBearer.statusCode).toBe(200);
  });

  it("rejects an expired local token without consulting Auth0", async () => {
    const user = await register("expired@example.com");
    const expired = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: -10 });
    const fetchSpy = jest.spyOn(global, "fetch");
    const originalDomain = process.env.AUTH0_DOMAIN;
    process.env.AUTH0_DOMAIN = "example.auth0.com";
    try {
      const res = await request(app).get("/api/auth/me").set(bearer(expired));
      expect(res.statusCode).toBe(401);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      if (originalDomain === undefined) delete process.env.AUTH0_DOMAIN;
      else process.env.AUTH0_DOMAIN = originalDomain;
      fetchSpy.mockRestore();
    }
  });

  it("lets two tabs refresh with the same cookie at the same time", async () => {
    const { res } = await register("tabs@example.com");
    const cookie = refreshCookie(res).split(";")[0];

    const [a, b] = await Promise.all([
      request(app).post("/api/auth/refresh").set("Cookie", cookie),
      request(app).post("/api/auth/refresh").set("Cookie", cookie),
    ]);
    expect(a.statusCode).toBe(200);
    expect(b.statusCode).toBe(200);
  });

  it("treats a rotated token presented after the grace window as theft and revokes the family", async () => {
    const { res } = await register("reuse@example.com");
    const stolen = refreshCookie(res).split(";")[0];

    const rotated = await request(app).post("/api/auth/refresh").set("Cookie", stolen);
    expect(rotated.statusCode).toBe(200);
    const current = refreshCookie(rotated).split(";")[0];

    await RefreshToken.updateMany({ revoked: true }, { $set: { revokedAt: new Date(Date.now() - 60 * 1000) } });

    const replay = await request(app).post("/api/auth/refresh").set("Cookie", stolen);
    expect(replay.statusCode).toBe(401);

    // The legitimate holder's newer token died with the family.
    const legit = await request(app).post("/api/auth/refresh").set("Cookie", current);
    expect(legit.statusCode).toBe(401);
  });

  it("does not apply the grace window to a token revoked by logout", async () => {
    const agent = request.agent(app);
    const { res } = await register("logout-grace@example.com", agent);
    const cookie = refreshCookie(res).split(";")[0];
    await agent.post("/api/auth/logout");

    const after = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(after.statusCode).toBe(401);
  });
});

describe("certificate claims", () => {
  it("reports pass/fail only on a failed attempt, never the score", async () => {
    const user = await register("cert@example.com");
    const questions = Array.from({ length: 5 }, (_, i) => ({
      question: `Q${i}`,
      options: ["a", "b", "c", "d"],
      correctAnswer: 0,
      explanation: "because",
    }));
    const { course } = await seedCourse(user.id, { finalTest: { generatedAt: new Date(), questions } });

    const fail = await request(app)
      .post(`/api/certificates/claim/${course._id}`)
      .set(bearer(user.token))
      .send({ answers: [0, 1, 1, 1, 1] });
    expect(fail.statusCode).toBe(200);
    expect(fail.body.passed).toBe(false);
    expect(fail.body).not.toHaveProperty("averageScore");

    const pass = await request(app)
      .post(`/api/certificates/claim/${course._id}`)
      .set(bearer(user.token))
      .send({ answers: [0, 0, 0, 0, 1] });
    expect(pass.body.passed).toBe(true);
    expect(pass.body.averageScore).toBe(80);
  });
});

describe("guest accounts and public profiles", () => {
  it("keeps guest accounts off public pages", async () => {
    const guest = await User.create({ name: "Guest", email: "guest@demo.courseai.local", isDemo: true, isProfilePublic: true, xp: 9999 });
    const guestToken = jwt.sign({ id: String(guest._id) }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "5m" });

    const update = await request(app).put("/api/user/profile").set(bearer(guestToken)).send({ isProfilePublic: true });
    expect(update.statusCode).toBe(403);

    const board = await request(app).get("/api/collab/leaderboard?guest-test=1");
    expect(board.body.map((u) => String(u._id))).not.toContain(String(guest._id));

    const profile = await request(app).get(`/api/collab/profile/${guest._id}`);
    expect(profile.statusCode).toBe(404);
  });

  it("accepts only https avatar URLs", async () => {
    const user = await register("avatar@example.com");
    for (const avatar of ["http://example.com/a.png", "javascript:alert(1)", "data:image/png;base64,AAAA"]) {
      const res = await request(app).put("/api/user/profile").set(bearer(user.token)).send({ avatar });
      expect(res.statusCode).toBe(400);
    }
    const ok = await request(app).put("/api/user/profile").set(bearer(user.token)).send({ avatar: "https://example.com/a.png" });
    expect(ok.statusCode).toBe(200);
  });
});

describe("request tracing", () => {
  it("echoes a well-formed trace id and replaces anything else", async () => {
    const good = await request(app).get("/api/health").set("x-trace-id", "abc-123");
    expect(good.headers["x-trace-id"]).toBe("abc-123");

    const bad = await request(app).get("/api/health").set("x-trace-id", "a b <script>");
    expect(bad.headers["x-trace-id"]).not.toBe("a b <script>");
    expect(bad.headers["x-trace-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });
});
