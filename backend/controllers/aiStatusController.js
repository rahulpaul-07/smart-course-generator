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
              _id: { provider: "$provider", status: "$status" },
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

    // Fold the per-status groups into one row per provider.
    const stats = {};
    for (const row of perProvider) {
      const name = row._id.provider;
      stats[name] = stats[name] || { success: 0, failure: 0, avgLatencyMs: null };
      stats[name][row._id.status] = row.count;
      if (row._id.status === "success" && row.avgLatencyMs != null) {
        stats[name].avgLatencyMs = Math.round(row.avgLatencyMs);
      }
    }

    const providers = chain.map((entry) => {
      const s = stats[entry.provider] || { success: 0, failure: 0, avgLatencyMs: null };
      const total = s.success + s.failure;
      return {
        ...entry,
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

    return res.json({
      windowHours,
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
