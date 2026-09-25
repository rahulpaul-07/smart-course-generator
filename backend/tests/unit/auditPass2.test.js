/**
 * Pure-logic regressions from the second audit pass. No DB, no network.
 */
const { EventEmitter } = require("events");
const { cosineSimilarity, embedLocal } = require("../../services/retrieval/embedder");
const { xpForAction, ONCE_PER_RESOURCE } = require("../../services/achievementsService");
const { activeDayShare } = require("../../controllers/dashboardController");
const { watchSse } = require("../../utils/sse");

describe("cosineSimilarity", () => {
  // Bug: mismatched vectors were silently truncated to the shorter length.
  test("throws on a dimension mismatch", () => {
    expect(() => cosineSimilarity([1, 0, 0], [1, 0])).toThrow(/dimension mismatch/);
  });

  test("identical normalised vectors score 1", () => {
    const v = embedLocal("binary search trees");
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });
});

describe("XP rules", () => {
  test("every toggleable reward is once-per-resource", () => {
    for (const action of ["COMPLETED_LESSON", "COMPLETED_QUIZ", "PUBLISHED_COURSE", "UPVOTED_COURSE", "COURSE_UPVOTED_BY_OTHER"]) {
      expect(ONCE_PER_RESOURCE.has(action)).toBe(true);
    }
  });

  test("perfect-quiz bonus is its own action so it can be deduplicated", () => {
    expect(xpForAction("COMPLETED_QUIZ")).toBe(25);
    expect(xpForAction("PERFECT_QUIZ")).toBe(20);
    expect(xpForAction("NOT_A_THING")).toBe(0);
  });
});

describe("activeDayShare", () => {
  // Bug: active days were compared against UTC dates while streak history is
  // keyed in the user's zone. 20:00 UTC on the 10th is already the 11th in IST.
  test("counts days in the user's time zone", () => {
    const now = new Date("2026-03-10T20:00:00Z");
    expect(activeDayShare(["2026-03-11"], 7, "Asia/Kolkata", now)).toBe(14);
    expect(activeDayShare(["2026-03-11"], 7, "UTC", now)).toBe(0);
  });
});

describe("watchSse", () => {
  test("writes heartbeats while open and stops after close", () => {
    jest.useFakeTimers();
    const res = new EventEmitter();
    res.writableEnded = false;
    res.write = jest.fn();
    const onClose = jest.fn();

    watchSse(res, onClose, { intervalMs: 1000 });
    jest.advanceTimersByTime(3000);
    expect(res.write).toHaveBeenCalledTimes(3);
    expect(res.write).toHaveBeenCalledWith(": ping\n\n");

    res.emit("close");
    jest.advanceTimersByTime(5000);
    expect(res.write).toHaveBeenCalledTimes(3);
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
