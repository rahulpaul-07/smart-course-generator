#!/usr/bin/env node
/**
 * Eval harness: generate a course for each golden prompt, score it, and write a
 * versioned scorecard. Runs in CI as a smoke test (mock mode, no keys) and as a
 * real quality gate when AI keys are present.
 *
 * Usage:  node evals/runEvals.js            # scores + writes evals/report.md
 *         FAIL_UNDER=0.6 node evals/runEvals.js   # non-zero exit if below gate
 */
const fs = require("fs");
const path = require("path");
const { createCourseOutline } = require("../backend/services/courseGeneration");
const { scoreStructure, scoreFaithfulness } = require("./judge");

const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, "prompts.json"), "utf8"));

// Coverage and faithfulness only mean something against a real LLM. In mock mode
// (no keys) the router returns a fixed stub course, so we report those as n/a and
// keep only the structural-contract check — which stays meaningful everywhere.
const HAS_KEYS = !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);

function pct(x) { return x == null ? "n/a" : `${Math.round(x * 100)}%`; }

async function run() {
  const rows = [];
  for (const p of prompts) {
    let course, error = null;
    try {
      course = await createCourseOutline(p.prompt, "English");
    } catch (e) {
      error = e.message;
      course = null;
    }
    const structure = course ? scoreStructure(course, p.expectedSubtopics) : { structure: 0, coverage: 0, issues: [error] };
    const faith = course ? await scoreFaithfulness(p.prompt, course) : null;
    const coverage = HAS_KEYS ? structure.coverage : null; // n/a in mock mode
    rows.push({ id: p.id, error, structure: structure.structure, coverage, faithfulness: faith ? faith.faithfulness : null });
    console.log(`• ${p.id.padEnd(16)} structure=${pct(structure.structure)} coverage=${pct(coverage)} faithfulness=${faith ? pct(faith.faithfulness) : "n/a"}${error ? "  ERROR: " + error : ""}`);
  }

  const avg = (key) => {
    const vals = rows.map((r) => r[key]).filter((v) => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const aggregate = { structure: avg("structure"), coverage: avg("coverage"), faithfulness: avg("faithfulness") };

  const mockMode = rows.every((r) => r.faithfulness === null);
  const report = [
    "# Eval Scorecard",
    "",
    `_Generated: ${new Date().toISOString()} · mode: ${mockMode ? "mock (no AI keys — deterministic checks only)" : "live LLM judge"}_`,
    "",
    "| Prompt | Structure | Coverage | Faithfulness |",
    "|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${pct(r.structure)} | ${pct(r.coverage)} | ${pct(r.faithfulness)} |`),
    "",
    `**Aggregate** — structure ${pct(aggregate.structure)}, coverage ${pct(aggregate.coverage)}, faithfulness ${pct(aggregate.faithfulness)}.`,
    "",
    mockMode
      ? "> **Mock mode** (no AI keys): this is a structural-contract smoke test only. `coverage` and `faithfulness` require a real LLM — run `npm run eval` locally with a provider key (and `RAG_ENABLED=true`) to record real quality numbers, and commit the result here."
      : "> Live LLM judge. Re-run with `RAG_ENABLED=true` vs off to measure the faithfulness lift from RAG grounding.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(__dirname, "report.md"), report);
  console.log(`\nWrote evals/report.md`);

  const gate = Number(process.env.FAIL_UNDER || 0);
  if (gate > 0 && !mockMode && aggregate.faithfulness != null && aggregate.faithfulness < gate) {
    console.error(`\n✖ Faithfulness ${pct(aggregate.faithfulness)} is below gate ${pct(gate)}`);
    process.exit(1);
  }
  // Structural correctness must always hold, even in mock mode.
  if (aggregate.structure < 0.9) {
    console.error(`\n✖ Structural validity ${pct(aggregate.structure)} below 90% — generation contract broken.`);
    process.exit(1);
  }
}

run().catch((e) => { console.error("Eval run failed:", e); process.exit(1); });
