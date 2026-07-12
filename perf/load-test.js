#!/usr/bin/env node
/**
 * Lightweight load test for read-heavy public endpoints using autocannon.
 *
 * Usage:
 *   TARGET=http://localhost:8000 node perf/load-test.js
 *   TARGET=... DURATION=20 CONNECTIONS=50 PATH=/api/health node perf/load-test.js
 *
 * Prints RPS and p50/p90/p99 latency and writes perf/results.json. autocannon is
 * a devDependency; install with `npm i -D autocannon` in the backend if missing.
 */
const fs = require("fs");
const path = require("path");

let autocannon;
try {
  autocannon = require("autocannon");
} catch {
  console.error("autocannon not installed. Run: cd backend && npm i -D autocannon");
  process.exit(1);
}

const TARGET = process.env.TARGET || "http://localhost:8000";
const PATHNAME = process.env.PATH_UNDER_TEST || "/api/health/liveness";

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
      latency: { p50: result.latency.p50, p90: result.latency.p90, p99: result.latency.p99, max: result.latency.max },
      non2xx: result.non2xx,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(__dirname, "results.json"), JSON.stringify(summary, null, 2));
    console.log("\n=== Load test summary ===");
    console.log(`Target:   ${summary.target}`);
    console.log(`Req/sec:  ${summary.requestsPerSec.toFixed(1)}`);
    console.log(`Latency:  p50 ${summary.latency.p50}ms · p90 ${summary.latency.p90}ms · p99 ${summary.latency.p99}ms`);
    console.log(`Non-2xx:  ${summary.non2xx}`);
    console.log("Wrote perf/results.json");
  }
);
autocannon.track(instance, { renderProgressBar: true });
