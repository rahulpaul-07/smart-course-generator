const AiTelemetry = require("../models/AiTelemetry");
const circuitBreaker = require("../services/circuitBreaker");
const aiRouter = require("../services/aiRouter");

const { fallbackChain } = aiRouter._internal;

/** Providers are ordered; position 0 is tried first, and so on down the chain. */
function describeChain() {
  const breakers = circuitBreaker.snapshot();

  return fallbackChain.map((entry, position) => {
    const raw = process.env[entry.key] || "";
    // A provider key may hold a comma-separated pool that KeyManager rotates
    // through. The count matters operationally; the keys themselves never leave
    // the server.
    const keyCount = raw.split(",").map((k) => k.trim()).filter(Boolean).length;
    const breaker = breakers[entry.provider.name];

    return {
      position,
      provider: entry.provider.name,
      model: entry.model,
      envVar: entry.key,
      configured: keyCount > 0,
      keyCount,
      breaker: breaker || {
        status: keyCount > 0 ? "closed" : "unconfigured",
        failures: 0,
        threshold: circuitBreaker.threshold,
        openedAt: null,
        retryInMs: 0,
      },
    };
  });
}

/**
 * Health beyond the circuit breaker. 4xx failures deliberately don't trip the
 * breaker (a bad prompt isn't an outage), which also meant a *retired model*
 * showed as "closed" -- healthy -- while 100% of its calls returned 404. That
 * is exactly how production generation broke unnoticed in September 2026.
 */
function classifyHealth(entry, s, recent) {
  if (!entry.configured) return { status: "unconfigured", message: `${entry.envVar} is not set.` };
  const last = recent.find((r) => r.provider === entry.provider && r.model === entry.model);
  const reason = String(last?.reason || "").toLowerCase();
  if (last?.status === "failure" && (reason.includes("model_not_found") || reason.includes("does not exist") || reason.startsWith("404"))) {
    return { status: "misconfigured", message: `Model "${entry.model}" was not found. It may have been retired; set a current model ID in the environment.` };
  }
  const total = s.success + s.failure;
  if (total >= 3 && s.success === 0) {
    return { status: "failing", message: `All ${total} recent calls failed. Last error: ${last?.reason || "unknown"}` };
  }
  return { status: total === 0 ? "idle" : "ok", message: null };
}

/**
 * GET /api/ai/status
 *
 * The router's failover behaviour was previously only observable by reading
 * server logs at the moment a request happened. This exposes the same state
 * the router itself acts on: which providers are configured, which the circuit
 * breaker is currently skipping, and what the recent success rate and latency
 * look like per provider.
 */
async function getAiStatus(req, res) {
  try {
    const windowHours = Math.min(Math.max(Number(req.query.hours) || 24, 1), 168);
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const chain = describeChain();

    // Telemetry is best-effort: the panel must still render the live breaker
    // and configuration state if the collection is empty or unreachable.
    let perProvider = [];
    let recent = [];
    try {
      [perProvider, recent] = await Promise.all([
        AiTelemetry.aggregate([
          { $match: { timestamp: { $gte: since } } },
          {
            $group: {
              _id: { provider: "$provider", model: "$model", status: "$status" },
              count: { $sum: 1 },
              avgLatencyMs: { $avg: "$latencyMs" },
              lastSeen: { $max: "$timestamp" },
            },
          },
        ]),
        AiTelemetry.find({ timestamp: { $gte: since } })
          .sort({ timestamp: -1 })
          .limit(40)
          .select("provider model endpoint status reason latencyMs attempt timestamp")
          .lean(),
      ]);
    } catch (telemetryErr) {
      console.warn("[AI Status] telemetry unavailable:", telemetryErr.message);
    }

    // Fold the per-status groups into one row per provider *and model*. Keyed
    // by provider alone, two Groq models shared one set of numbers, so a
    // retired model was indistinguishable from a working one.
    const stats = {};
    for (const row of perProvider) {
      const name = `${row._id.provider}:${row._id.model}`;
      stats[name] = stats[name] || { success: 0, failure: 0, avgLatencyMs: null };
      stats[name][row._id.status] = row.count;
      if (row._id.status === "success" && row.avgLatencyMs != null) {
        stats[name].avgLatencyMs = Math.round(row.avgLatencyMs);
      }
    }

    const providers = chain.map((entry) => {
      const s = stats[`${entry.provider}:${entry.model}`] || { success: 0, failure: 0, avgLatencyMs: null };
      const total = s.success + s.failure;
      return {
        ...entry,
        health: classifyHealth(entry, s, recent),
        window: {
          success: s.success,
          failure: s.failure,
          total,
          successRate: total > 0 ? Math.round((s.success / total) * 100) : null,
          avgLatencyMs: s.avgLatencyMs,
        },
      };
    });

    // A request served by anything other than chain position 0 is a failover.
    const failovers = recent.filter((r) => r.status === "success" && r.attempt > 0).length;

    const alerts = providers
      .filter((p) => p.health.status === "misconfigured" || p.health.status === "failing")
      .map((p) => ({ provider: p.provider, model: p.model, status: p.health.status, message: p.health.message }));

    return res.json({
      windowHours,
      alerts,
      generatedAt: new Date().toISOString(),
      anyProviderConfigured: providers.some((p) => p.configured),
      providers,
      recent,
      summary: {
        requests: recent.length,
        failovers,
      },
    });
  } catch (error) {
    console.error("[AI Status] failed:", error);
    return res.status(500).json({ error: "Could not read AI router status." });
  }
}

module.exports = { getAiStatus, describeChain };
