/**
 * Regression tests for interview-pack generation.
 *
 * The reported symptom was a 502 "The AI generated an invalid interview pack"
 * on a perfectly reasonable topic. The cause was a validator that demanded an
 * exact shape from a non-deterministic producer: a model returning
 * `"correctAnswer": "B"` instead of `1` failed the whole pack, which then
 * retried across every provider before surfacing an error naming no cause.
 */
const { _internal } = require("../../controllers/interviewController");
const { normalizeInterviewPack, validateInterviewPack } = _internal;

const pack = (correctAnswer) => ({
  mcqs: [{ question: "Q1", options: ["A", "B", "C", "D"], correctAnswer, explanation: "e" }],
  theoryQuestions: [{ question: "T1", idealAnswer: "a" }],
  codingQuestions: [{ title: "C1", problemStatement: "p" }],
});

describe("normalizeInterviewPack", () => {
  test.each([
    ["a numeric index", 2, 2],
    ["a numeric string", "2", 2],
    ["an option letter", "B", 1],
    ["the answer text itself", "C", 2],
    ["index zero", 0, 0],
  ])("coerces correctAnswer given %s", async (_label, input, expected) => {
    const normalized = normalizeInterviewPack(pack(input));
    await expect(validateInterviewPack(normalized)).resolves.toBeUndefined();
    expect(normalized.mcqs[0].correctAnswer).toBe(expected);
  });

  test("accepts common key aliases for the four sections", async () => {
    const normalized = normalizeInterviewPack({
      mcq: [{ question: "Q", options: ["A", "B"], correctAnswer: 0 }],
      theory: [{ question: "T", idealAnswer: "a" }],
      coding: [{ title: "C", problemStatement: "p" }],
    });
    await expect(validateInterviewPack(normalized)).resolves.toBeUndefined();
  });
});

describe("validateInterviewPack", () => {
  // The duplicate set used to be shared across all three sections, so a coding
  // challenge titled the same as an MCQ stem sank an otherwise valid pack.
  test("allows a coding title that matches an MCQ question", async () => {
    const normalized = normalizeInterviewPack({
      mcqs: [{ question: "Binary Search", options: ["A", "B"], correctAnswer: 0 }],
      theoryQuestions: [{ question: "T", idealAnswer: "a" }],
      codingQuestions: [{ title: "Binary Search", problemStatement: "p" }],
    });
    await expect(validateInterviewPack(normalized)).resolves.toBeUndefined();
  });

  test("still rejects a duplicate within one section", async () => {
    const dup = {
      mcqs: [
        { question: "Same", options: ["A", "B"], correctAnswer: 0 },
        { question: "Same", options: ["A", "B"], correctAnswer: 1 },
      ],
      theoryQuestions: [{ question: "T", idealAnswer: "a" }],
      codingQuestions: [{ title: "C", problemStatement: "p" }],
    };
    await expect(validateInterviewPack(normalizeInterviewPack(dup))).rejects.toThrow(/duplicate/i);
  });

  test("rejects an out-of-range answer index", async () => {
    await expect(validateInterviewPack(normalizeInterviewPack(pack(99)))).rejects.toThrow(/not a valid index/);
  });

  test("rejects an empty pack", async () => {
    await expect(
      validateInterviewPack(normalizeInterviewPack({ mcqs: [], theoryQuestions: [], codingQuestions: [] }))
    ).rejects.toThrow(/no MCQs/);
  });

  // Without this tag the AI router counted a malformed generation against the
  // provider's circuit breaker and benched a provider that was working fine.
  test("tags failures as schema_validation so the circuit breaker ignores them", async () => {
    expect.assertions(2);
    try {
      await validateInterviewPack(normalizeInterviewPack(pack(99)));
    } catch (err) {
      expect(err.failureCategory).toBe("schema_validation");
      const { countsAgainstProviderHealth } = require("../../services/aiRouter")._internal;
      expect(countsAgainstProviderHealth(err)).toBe(false);
    }
  });
});
