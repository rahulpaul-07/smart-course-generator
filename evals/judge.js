/**
 * LLM-as-judge scoring rubric for generated course outlines.
 *
 * Combines deterministic structural checks with an LLM faithfulness rating.
 * When no AI keys are set, the router runs in mock mode and the judge degrades
 * to deterministic-only scoring so the harness still runs in CI as a smoke test.
 */
const { generateJson } = require("../backend/services/aiRouter");

/** Deterministic checks that need no LLM. */
function scoreStructure(course, expectedSubtopics = []) {
  const issues = [];
  if (!course || typeof course !== "object") return { structure: 0, coverage: 0, issues: ["not an object"] };

  const hasTitle = typeof course.title === "string" && course.title.length > 0;
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const hasModules = modules.length >= 1;
  const lessonsOk = modules.every((m) => Array.isArray(m.lessons) && m.lessons.length >= 1);
  if (!hasTitle) issues.push("missing title");
  if (!hasModules) issues.push("no modules");
  if (!lessonsOk) issues.push("a module has no lessons");

  const structure = [hasTitle, hasModules, lessonsOk].filter(Boolean).length / 3;

  // Coverage: how many expected subtopics appear anywhere in the outline text.
  const haystack = JSON.stringify(course).toLowerCase();
  const hit = expectedSubtopics.filter((t) => haystack.includes(t.toLowerCase()));
  const coverage = expectedSubtopics.length ? hit.length / expectedSubtopics.length : 1;

  return { structure, coverage, matchedSubtopics: hit, issues };
}

/** LLM faithfulness rating 0..1. Returns null in mock mode (no keys). */
async function scoreFaithfulness(prompt, course) {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return null; // mock mode → skip judge
  }
  const system = [
    "You are a strict Course Reviewer Agent evaluating an AI-generated course outline.",
    "Rate faithfulness and correctness on a 0-10 integer scale where 10 = fully accurate,",
    "well-scoped, and free of hallucinated or misleading content for the requested topic.",
    'Return MINIFIED JSON: {"rating": <0-10 int>, "reasons": ["..."]}. No prose.',
  ].join(" ");
  const user = `Requested topic:\n${prompt}\n\nGenerated outline:\n${JSON.stringify(course).slice(0, 6000)}`;
  const res = await generateJson(system, user, 512);
  const rating = Math.max(0, Math.min(10, Number(res.rating) || 0));
  return { faithfulness: rating / 10, reasons: res.reasons || [] };
}

module.exports = { scoreStructure, scoreFaithfulness };
