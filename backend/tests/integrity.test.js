/**
 * Regression tests for the second audit pass: account-takeover paths,
 * XP-farming loops, and input that used to be trusted as-is.
 */
const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { resolveAuth0User } = require("../middlewares/auth0Auth");

async function register(email, name = "Test User") {
  const res = await request(app).post("/api/auth/register").send({ email, password: "password123", name });
  return { token: res.body.token, id: res.body._id };
}

async function seedCourse(creator, { isPublic = false } = {}) {
  const course = await Course.create({ title: "Seed", description: "d", creator, isPublic, shareId: isPublic ? `s-${Date.now()}` : undefined });
  const mod = await Module.create({ course: course._id, title: "M1", order: 0 });
  const lesson = await Lesson.create({ module: mod._id, title: "L1", order: 0 });
  mod.lessons = [lesson._id];
  await mod.save();
  course.modules = [mod._id];
  await course.save();
  return { course, lesson };
}

const xpOf = async (id) => (await User.findById(id).select("xp").lean()).xp;

describe("auth: email normalisation", () => {
  // Bug: zod did not lowercase, the model did. "Mixed@Case.com" could register
  // (stored lowercase) but every later login missed the lookup and 401'd.
  it("logs in regardless of email casing", async () => {
    await register("Mixed.Case@Example.com");
    const res = await request(app).post("/api/auth/login").send({ email: "MIXED.case@example.COM", password: "password123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("mixed.case@example.com");
  });
});

describe("auth: Auth0 identity resolution", () => {
  beforeEach(async () => {
    await register("victim@example.com", "Victim");
  });

  // Bug: findOne({ email: undefined }) became findOne({}) and returned the
  // first user in the collection.
  it("rejects a profile with no email instead of matching an arbitrary user", async () => {
    await expect(resolveAuth0User({ sub: "auth0|attacker" })).rejects.toThrow(/no email/);
  });

  it("refuses to link an unverified email to an existing account", async () => {
    await expect(
      resolveAuth0User({ sub: "auth0|attacker", email: "victim@example.com", email_verified: false })
    ).rejects.toThrow(/not verified/);
  });

  it("links a verified email and finds the user by subject afterwards", async () => {
    const linked = await resolveAuth0User({ sub: "auth0|victim", email: "Victim@Example.com", email_verified: true });
    expect(linked.email).toBe("victim@example.com");
    const again = await resolveAuth0User({ sub: "auth0|victim" });
    expect(String(again._id)).toBe(String(linked._id));
  });
});

describe("XP integrity", () => {
  it("completing, un-completing and re-completing a lesson awards XP once", async () => {
    const { token, id } = await register("learner@example.com");
    const { lesson } = await seedCourse(id);

    for (const completed of [true, false, true, false, true]) {
      const res = await request(app)
        .patch(`/api/courses/lessons/${lesson._id}/progress`)
        .set("Authorization", `Bearer ${token}`)
        .send({ completed });
      expect(res.statusCode).toBe(200);
    }
    expect(await xpOf(id)).toBe(10);
  });

  it("clamps client-supplied quiz scores and counts one attempt per submission", async () => {
    const { token, id } = await register("quizzer@example.com");
    const { lesson } = await seedCourse(id);

    const res = await request(app)
      .patch(`/api/courses/lessons/${lesson._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quizBestScore: 1e9, quizAttempts: 500 });

    expect(res.statusCode).toBe(200);
    expect(res.body.quizBestScore).toBe(5);
    expect(res.body.quizAttempts).toBe(1);

    // Retaking the quiz is recorded but earns nothing new (25 + 20 perfect).
    await request(app)
      .patch(`/api/courses/lessons/${lesson._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quizBestScore: 5, quizAttempts: 1 });
    expect(await xpOf(id)).toBe(45);
  });

  it("publish/unpublish cycles award publishing XP once", async () => {
    const { token, id } = await register("publisher@example.com");
    const { course } = await seedCourse(id);

    for (const enabled of [true, false, true]) {
      await request(app)
        .patch(`/api/courses/${course._id}/sharing`)
        .set("Authorization", `Bearer ${token}`)
        .send({ enabled });
    }
    expect(await xpOf(id)).toBe(50);
  });

  it("upvote toggling awards XP once, and self-upvotes give the creator nothing", async () => {
    const creator = await register("creator2@example.com");
    const voter = await register("voter@example.com");
    const { course } = await seedCourse(creator.id, { isPublic: true });

    for (let i = 0; i < 4; i++) {
      await request(app)
        .post(`/api/collab/templates/${course._id}/upvote`)
        .set("Authorization", `Bearer ${voter.token}`);
    }
    const self = await request(app)
      .post(`/api/collab/templates/${course._id}/upvote`)
      .set("Authorization", `Bearer ${creator.token}`);

    expect(self.body.hasUpvoted).toBe(true);
    expect(await xpOf(voter.id)).toBe(1);
    // 5 from the voter; the self-upvote adds only the 1 voter XP.
    expect(await xpOf(creator.id)).toBe(6);
    const fresh = await Course.findById(course._id).lean();
    expect(fresh.upvotesCount).toBe(1);
    expect(fresh.upvotedBy.map(String)).toEqual([String(creator.id)]);
  });
});

describe("request bodies are stored verbatim", () => {
  // Bug: xss-clean HTML-escaped every body string, so code and notes were
  // persisted as `a &lt; b`.
  it("keeps angle brackets in lesson notes", async () => {
    const { token, id } = await register("coder@example.com");
    const { lesson } = await seedCourse(id);
    const notes = "if (a < b && c > d) { return <Tag/>; }";

    const res = await request(app)
      .patch(`/api/courses/lessons/${lesson._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes });

    expect(res.body.notes).toBe(notes);
  });
});

describe("GET /api/dashboard/summary", () => {
  it("reports lesson-level completion", async () => {
    const { token, id } = await register("dash@example.com");
    const { course } = await seedCourse(id);
    const mod = await Module.findOne({ course: course._id });
    const extra = await Lesson.create({ module: mod._id, title: "L2", order: 1, completedAt: new Date() });
    mod.lessons.push(extra._id);
    await mod.save();

    const res = await request(app).get("/api/dashboard/summary").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.statistics.lessonsTotal).toBe(2);
    expect(res.body.statistics.lessonsCompleted).toBe(1);
    expect(res.body.progress.overallCompletion).toBe(50);
  });
});

describe("public community endpoints with real data", () => {
  // Bug: node-cache deep-cloned Mongoose documents and threw a CastError, so
  // /templates returned 500 as soon as one public course existed. The old test
  // only ever hit an empty collection.
  it("serves templates when public courses exist, twice (cache hit)", async () => {
    const { id } = await register("pub@example.com");
    await seedCourse(id, { isPublic: true });
    const first = await request(app).get("/api/collab/templates");
    const second = await request(app).get("/api/collab/templates");
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.body[0].creator.name).toBe("Test User");
  });

  it("activity feed omits users without a public profile", async () => {
    const priv = await register("private@example.com", "Private Person");
    const { course } = await seedCourse(priv.id);
    await request(app).patch(`/api/courses/${course._id}/sharing`).set("Authorization", `Bearer ${priv.token}`).send({ enabled: true });

    const res = await request(app).get("/api/collab/activity?nocache=1");
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("Private Person");
  });
});

describe("POST /api/auth/demo", () => {
  const { seedShowcase } = require("../scripts/seed_showcase");
  const original = process.env.DEMO_MODE;
  afterEach(() => { process.env.DEMO_MODE = original; });

  it("is disabled unless DEMO_MODE=true", async () => {
    process.env.DEMO_MODE = "false";
    const res = await request(app).post("/api/auth/demo");
    expect(res.statusCode).toBe(404);
  });

  it("creates an isolated guest with a cloned course that cannot be published", async () => {
    process.env.DEMO_MODE = "true";
    await seedShowcase();
    const a = await request(app).post("/api/auth/demo");
    const b = await request(app).post("/api/auth/demo");
    expect(a.statusCode).toBe(201);
    expect(a.body.isDemo).toBe(true);
    expect(a.body._id).not.toBe(b.body._id);

    const mine = await request(app).get("/api/courses/mine").set("Authorization", `Bearer ${a.body.token}`);
    expect(mine.body.length).toBe(1);

    const publish = await request(app)
      .patch(`/api/courses/${mine.body[0]._id}/sharing`)
      .set("Authorization", `Bearer ${a.body.token}`)
      .send({ enabled: true });
    expect(publish.statusCode).toBe(403);
  });
});
