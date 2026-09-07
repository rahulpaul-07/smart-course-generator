/**
 * Regression tests for defects found in the September 2026 audit.
 *
 * Each block names the bug it pins down. All of these run without a database,
 * a network connection or an API key.
 */
const { advanceStreak, dayKey, previousDayKey } = require("../../services/streakService");
const { parseRobustJson } = require("../../services/aiValidator");
const circuitBreaker = require("../../services/circuitBreaker");
const aiRouter = require("../../services/aiRouter");

describe("streakService", () => {
  const IST = "Asia/Kolkata";

  test("a second activity on the same day is a no-op", () => {
    const state = { studyStreak: 4, longestStreak: 9, lastActiveDate: "2026-03-10", activityHistory: ["2026-03-10"] };
    const now = new Date("2026-03-10T18:00:00Z");
    expect(advanceStreak(state, { now, timeZone: "UTC" })).toBeNull();
  });

  test("activity on the following day extends the streak", () => {
    const state = { studyStreak: 4, longestStreak: 9, lastActiveDate: "2026-03-10", activityHistory: ["2026-03-10"] };
    const next = advanceStreak(state, { now: new Date("2026-03-11T09:00:00Z"), timeZone: "UTC" });
    expect(next.studyStreak).toBe(5);
    expect(next.lastActiveDate).toBe("2026-03-11");
  });

  test("a missed day resets the streak to 1", () => {
    const state = { studyStreak: 12, longestStreak: 12, lastActiveDate: "2026-03-10", activityHistory: [] };
    const next = advanceStreak(state, { now: new Date("2026-03-13T09:00:00Z"), timeZone: "UTC" });
    expect(next.studyStreak).toBe(1);
  });

  // Bug: the dashboard reported `longest: studyStreak`, so the longest-streak
  // card dropped to 0 the moment a streak broke.
  test("longestStreak is a high-water mark that survives a reset", () => {
    const state = { studyStreak: 12, longestStreak: 12, lastActiveDate: "2026-03-10", activityHistory: [] };
    const next = advanceStreak(state, { now: new Date("2026-03-20T09:00:00Z"), timeZone: "UTC" });
    expect(next.studyStreak).toBe(1);
    expect(next.longestStreak).toBe(12);
  });

  test("longestStreak advances past its previous best", () => {
    const state = { studyStreak: 6, longestStreak: 6, lastActiveDate: "2026-03-10", activityHistory: [] };
    const next = advanceStreak(state, { now: new Date("2026-03-11T09:00:00Z"), timeZone: "UTC" });
    expect(next.longestStreak).toBe(7);
  });

  // Bug: the day was derived from toISOString(), i.e. a UTC calendar day. For a
  // user in IST (UTC+5:30) a session at 01:00 local on the 11th is 19:30 UTC on
  // the 10th, so it either failed to extend the streak or double-counted a day.
  test("late-night IST activity lands on the correct local day", () => {
    const beforeMidnightUtc = new Date("2026-03-10T19:30:00Z"); // 2026-03-11 01:00 IST
    expect(dayKey(beforeMidnightUtc, "UTC")).toBe("2026-03-10");
    expect(dayKey(beforeMidnightUtc, IST)).toBe("2026-03-11");

    const state = { studyStreak: 3, longestStreak: 3, lastActiveDate: "2026-03-10", activityHistory: ["2026-03-10"] };
    const next = advanceStreak(state, { now: beforeMidnightUtc, timeZone: IST });
    expect(next.studyStreak).toBe(4);
    expect(next.lastActiveDate).toBe("2026-03-11");
  });

  test("an unknown timezone falls back to UTC instead of throwing", () => {
    expect(() => dayKey(new Date("2026-03-10T12:00:00Z"), "Not/AZone")).not.toThrow();
    expect(dayKey(new Date("2026-03-10T12:00:00Z"), "Not/AZone")).toBe("2026-03-10");
  });

  test("previousDayKey crosses month and year boundaries", () => {
    expect(previousDayKey("2026-03-01")).toBe("2026-02-28");
    expect(previousDayKey("2026-01-01")).toBe("2025-12-31");
    expect(previousDayKey("2024-03-01")).toBe("2024-02-29"); // leap year
  });

  test("activity history is capped at 365 entries", () => {
    const history = Array.from({ length: 365 }, (_, i) => `hist-${i}`);
    const next = advanceStreak(
      { studyStreak: 1, longestStreak: 1, lastActiveDate: "2026-03-10", activityHistory: history },
      { now: new Date("2026-03-11T09:00:00Z"), timeZone: "UTC" }
    );
    expect(next.activityHistory).toHaveLength(365);
    expect(next.activityHistory[364]).toBe("2026-03-11");
    expect(next.activityHistory[0]).toBe("hist-1");
  });
});

describe("parseRobustJson", () => {
  test("parses a bare JSON object", () => {
    expect(parseRobustJson('{"a":1}')).toEqual({ a: 1 });
  });

  test("strips a json code fence", () => {
    expect(parseRobustJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  // Bug: fences were stripped before trimming, so /\n?```$/ never matched a
  // response ending in "```\n" -- which Gemini and Groq both emit -- and the
  // closing fence reached JSON.parse.
  test("strips a fence followed by a trailing newline", () => {
    expect(parseRobustJson('```json\n{"a":1}\n```\n')).toEqual({ a: 1 });
  });

  test("extracts a fenced block wrapped in prose", () => {
    const payload = 'Here is the JSON you asked for:\n```json\n{"a":1}\n```\nHope that helps!';
    expect(parseRobustJson(payload)).toEqual({ a: 1 });
  });

  test("handles an unlabelled fence with trailing whitespace", () => {
    expect(parseRobustJson('```\n{"a":1}\n```   ')).toEqual({ a: 1 });
  });

  test("still rejects an empty response", () => {
    expect(() => parseRobustJson("")).toThrow(/Empty response/);
  });

  test("still rejects truncated JSON", () => {
    expect(() => parseRobustJson('{"a":1')).toThrow(/Truncated JSON/);
  });

  test("attaches the parse cause for debugging", () => {
    try {
      parseRobustJson("{not json at all}");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err.failureCategory).toBe("invalid_json");
      expect(err.cause).toBeInstanceOf(Error);
    }
  });
});

describe("circuitBreaker", () => {
  beforeEach(() => circuitBreaker.reset());

  test("stays closed below the failure threshold", () => {
    circuitBreaker.onFailure("p");
    circuitBreaker.onFailure("p");
    expect(circuitBreaker.isOpen("p")).toBe(false);
  });

  test("opens at the threshold and a success closes it again", () => {
    for (let i = 0; i < 3; i++) circuitBreaker.onFailure("p");
    expect(circuitBreaker.isOpen("p")).toBe(true);
    circuitBreaker.onSuccess("p");
    expect(circuitBreaker.isOpen("p")).toBe(false);
  });

  test("half-opens once the cooldown has elapsed", () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, "now");
    spy.mockReturnValue(now);
    for (let i = 0; i < 3; i++) circuitBreaker.onFailure("p");
    expect(circuitBreaker.isOpen("p")).toBe(true);

    spy.mockReturnValue(now + 31_000);
    expect(circuitBreaker.isOpen("p")).toBe(false); // one probe allowed
    spy.mockRestore();
  });
});

describe("aiRouter guards", () => {
  const { hasNoConfiguredProvider, countsAgainstProviderHealth, resolveChain } = aiRouter._internal;
  const KEYS = ["GEMINI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY"];
  let saved;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map(k => [k, process.env[k]]));
    KEYS.forEach(k => delete process.env[k]);
    circuitBreaker.reset();
  });

  afterEach(() => {
    KEYS.forEach(k => {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    });
  });

  test("mock content is served only when no provider is configured at all", () => {
    expect(hasNoConfiguredProvider()).toBe(true);
    process.env.GROQ_API_KEY = "gsk_test";
    expect(hasNoConfiguredProvider()).toBe(false);
  });

  // Bug: the old guard was `chain.length === 0 && !process.env.GEMINI_API_KEY`.
  // On a Groq-only deployment an open breaker satisfied both halves, so a
  // transient outage served users fabricated placeholder course content.
  test("an open breaker on a Groq-only deployment does not trigger the mock path", () => {
    process.env.GROQ_API_KEY = "gsk_test";
    for (let i = 0; i < 3; i++) circuitBreaker.onFailure("groq");
    expect(aiRouter._internal.getProviderChain()).toHaveLength(0);
    expect(hasNoConfiguredProvider()).toBe(false);
  });

  test("the last-resort chain uses configured providers, not a hardcoded Gemini", () => {
    process.env.GROQ_API_KEY = "gsk_test";
    const chain = resolveChain([]);
    expect(chain.length).toBeGreaterThan(0);
    expect(chain.every(item => item.key === "GROQ_API_KEY")).toBe(true);
  });

  test("client and validation errors do not count against provider health", () => {
    expect(countsAgainstProviderHealth({ status: 401 })).toBe(false);
    expect(countsAgainstProviderHealth({ status: 400 })).toBe(false);
    expect(countsAgainstProviderHealth({ failureCategory: "invalid_json" })).toBe(false);
    expect(countsAgainstProviderHealth(new Error("schema validation failed"))).toBe(false);
  });

  test("genuine availability failures still count", () => {
    expect(countsAgainstProviderHealth({ status: 503 })).toBe(true);
    expect(countsAgainstProviderHealth(new Error("Request timed out"))).toBe(true);
    expect(countsAgainstProviderHealth({ status: 429 })).toBe(true);
  });
});
