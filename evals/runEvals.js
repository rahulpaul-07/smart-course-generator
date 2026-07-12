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

function pct(x) { return `${Math.round(x * 100)}%`; }

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
    rows.push({ id: p.id, error, ...structure, faithfulness: faith ? faith.faithfulness : null });
    const f = faith ? pct(faith.faithfulness) : "n/a (mock)";
    console.log(`• ${p.id.padEnd(16)} structure=${pct(structure.structure)} coverage=${pct(structure.coverage)} faithfulness=${f}${error ? "  ERROR: " + error : ""}`);
  }

  const avg = (key) => {
    const vals = rows.map((r) => r[key]).filter((v) => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const aggregate = { structure: avg("structure"), coverage: avg("coverage"), faithfulness: avg("faithfulness") };

  const mockMode = rows.every((r) => r.faithfulness === null);
  const report = [
    "# CourseAI Pro — Eval Scorecard",
    "",
    `_Generated: ${new Date().toISOString()} · mode: ${mockMode ? "mock (no AI keys — deterministic checks only)" : "live LLM judge"}_`,
    "",
    "| Prompt | Structure | Coverage | Faithfulness |",
    "|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${pct(r.structure)} | ${pct(r.coverage)} | ${r.faithfulness == null ? "n/a" : pct(r.faithfulness)} |`),
    "",
    `**Aggregate** — structure ${pct(aggregate.structure)}, coverage ${pct(aggregate.coverage)}, faithfulness ${aggregate.faithfulness == null ? "n/a (mock mode)" : pct(aggregate.faithfulness)}.`,
    "",
    "> Tip: run with real AI keys + `RAG_ENABLED=true` to measure the faithfulness lift from RAG grounding, and commit the before/after numbers.",
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
