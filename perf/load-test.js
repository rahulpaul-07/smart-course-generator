#!/usr/bin/env node
/**
 * Load test for the running API using autocannon. CI runs it against the real
 * server on an in-memory MongoDB (see the load-test job in ci.yml).
 *
 * Usage (from backend/, where autocannon is a devDependency):
 *   npm run load-test
 *   TARGET=http://localhost:8000 PATH_UNDER_TEST=/api/health/readiness \
 *     DURATION=10 CONNECTIONS=25 MAX_P99_MS=250 npm run load-test
 *
 * Prints RPS and p50/p90/p99 latency and writes perf/results-<path>.json. Exits
 * non-zero on any connection error, timeout or non-2xx response, or when p99
 * exceeds MAX_P99_MS (if set), so CI fails on a regression instead of printing it.
 */
const fs = require("fs");
const path = require("path");

// This file lives in perf/, so a bare require would never look in
// backend/node_modules, which is where autocannon is installed.
let autocannon;
try {
  autocannon = require(require.resolve("autocannon", { paths: [path.join(__dirname, "../backend")] }));
} catch {
  console.error("autocannon not installed. Run: cd backend && npm ci");
  process.exit(1);
}

const TARGET = process.env.TARGET || "http://localhost:8000";
const PATHNAME = process.env.PATH_UNDER_TEST || "/api/health/liveness";
const MAX_P99_MS = Number(process.env.MAX_P99_MS || 0); // 0: report only

const instance = autocannon(
  {
    url: `${TARGET}${PATHNAME}`,
    connections: Number(process.env.CONNECTIONS || 25),
    duration: Number(process.env.DURATION || 15),
    pipelining: 1,
  },
  (err, result) => {
    if (err) { console.error(err); process.exit(1); }
    const summary = {
      target: `${TARGET}${PATHNAME}`,
      requestsPerSec: result.requests.average,
      requests: result.requests.total,
      latency: { p50: result.latency.p50, p90: result.latency.p90, p99: result.latency.p99, max: result.latency.max },
      non2xx: result.non2xx,
      errors: result.errors,
      timeouts: result.timeouts,
      maxP99Ms: MAX_P99_MS || null,
      timestamp: new Date().toISOString(),
    };
    const slug = PATHNAME.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
    const out = path.join(__dirname, `results-${slug}.json`);
    fs.writeFileSync(out, JSON.stringify(summary, null, 2));
    console.log("\n=== Load test summary ===");
    console.log(`Target:   ${summary.target}`);
    console.log(`Requests: ${summary.requests} (${summary.requestsPerSec.toFixed(1)}/s)`);
    console.log(`Latency:  p50 ${summary.latency.p50}ms · p90 ${summary.latency.p90}ms · p99 ${summary.latency.p99}ms`);
    console.log(`Non-2xx:  ${summary.non2xx} · errors ${summary.errors} · timeouts ${summary.timeouts}`);
    console.log(`Wrote ${path.relative(process.cwd(), out)}`);

    const failures = [];
    if (summary.errors) failures.push(`${summary.errors} connection errors`);
    if (summary.timeouts) failures.push(`${summary.timeouts} timeouts`);
    if (summary.non2xx) failures.push(`${summary.non2xx} non-2xx responses`);
    if (MAX_P99_MS && summary.latency.p99 > MAX_P99_MS) {
      failures.push(`p99 ${summary.latency.p99}ms is over the ${MAX_P99_MS}ms budget`);
    }
    if (failures.length) {
      console.error(`\n✖ Load test failed: ${failures.join("; ")}`);
      process.exit(1);
    }
    console.log("✔ Within budget");
  }
);
autocannon.track(instance, { renderProgressBar: !process.env.CI });
