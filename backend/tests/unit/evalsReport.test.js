/**
 * The scorecard is written by evals/runEvals.js and read back by the
 * /api/evals/report endpoint, so its markdown is a contract between two files
 * that never import each other. These tests pin that contract -- in particular
 * the distinction between "n/a" (not measured) and "0%" (measured and failed),
 * which collapses into the same falsy value if parsing is careless.
 */
const { parseReport, parseScore } = require("../../controllers/evalsController");

const MOCK_REPORT = `# Eval Scorecard

_Generated: 2026-07-12T23:35:38.328Z · mode: mock (no AI keys — deterministic checks only)_

| Prompt | Structure | Coverage | Faithfulness |
|---|---|---|---|
| json-basics | 100% | n/a | n/a |
| http-methods | 100% | n/a | n/a |

**Aggregate** — structure 100%, coverage n/a, faithfulness n/a.

> **Mock mode** (no AI keys): this is a structural-contract smoke test only.
`;

const LIVE_REPORT = `# Eval Scorecard

_Generated: 2026-09-01T10:00:00.000Z · mode: live LLM judge_

| Prompt | Structure | Coverage | Faithfulness |
|---|---|---|---|
| json-basics | 100% | 67% | 80% |
| http-methods | 67% | 0% | 40% |

**Aggregate** — structure 84%, coverage 34%, faithfulness 60%.

> Live LLM judge.
`;

describe("parseScore", () => {
  test("distinguishes an unmeasured metric from a zero score", () => {
    expect(parseScore("n/a")).toBeNull();
    expect(parseScore("0%")).toBe(0);
  });

  test("returns a 0..1 fraction", () => {
    expect(parseScore("100%")).toBe(1);
    expect(parseScore("67%")).toBeCloseTo(0.67);
  });

  test("returns null for anything it does not recognise", () => {
    expect(parseScore("")).toBeNull();
    expect(parseScore("pending")).toBeNull();
    expect(parseScore(undefined)).toBeNull();
  });
});

describe("parseReport", () => {
  test("reads mode, timestamp and note from a mock-mode report", () => {
    const parsed = parseReport(MOCK_REPORT);
    expect(parsed.mode).toBe("mock");
    expect(parsed.generatedAt).toBe("2026-07-12T23:35:38.328Z");
    expect(parsed.note).toMatch(/structural-contract smoke test/);
  });

  test("keeps table header and separator rows out of the results", () => {
    const parsed = parseReport(MOCK_REPORT);
    expect(parsed.rows.map((r) => r.id)).toEqual(["json-basics", "http-methods"]);
  });

  test("marks unmeasured metrics as null rather than zero", () => {
    const [row] = parseReport(MOCK_REPORT).rows;
    expect(row.structure).toBe(1);
    expect(row.coverage).toBeNull();
    expect(row.faithfulness).toBeNull();
    expect(parseReport(MOCK_REPORT).aggregate).toEqual({
      structure: 1,
      coverage: null,
      faithfulness: null,
    });
  });

  test("reads a live report, including a genuine zero", () => {
    const parsed = parseReport(LIVE_REPORT);
    expect(parsed.mode).toBe("live");
    expect(parsed.rows[1]).toMatchObject({ id: "http-methods", coverage: 0, faithfulness: 0.4 });
    expect(parsed.aggregate.faithfulness).toBeCloseTo(0.6);
  });

  test("does not throw on an empty or truncated report", () => {
    expect(parseReport("").rows).toEqual([]);
    expect(parseReport("# Eval Scorecard").aggregate).toEqual({
      structure: null,
      coverage: null,
      faithfulness: null,
    });
  });
});
