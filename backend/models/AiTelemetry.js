const mongoose = require('mongoose');

const aiTelemetrySchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  endpoint: {
    type: String,
    required: true,
    enum: ['generateJson', 'generateJsonStream', 'generateText', 'generateTextStream'],
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure'],
  },
  reason: {
    type: String,
    default: null,
  },
  // Wall-clock duration of the provider call. Without this the telemetry could
  // say which provider answered but not whether it answered quickly.
  latencyMs: {
    type: Number,
    default: null,
  },
  // 0 for the first provider in the chain, 1 for the first failover, and so on.
  // This is what makes a failover visible after the fact rather than only in
  // the logs at the moment it happened.
  attempt: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Index for fast querying by status or provider
aiTelemetrySchema.index({ provider: 1, model: 1 });
aiTelemetrySchema.index({ status: 1 });
aiTelemetrySchema.index({ timestamp: -1 });
// TTL index: auto-expire telemetry after 30 days to bound collection growth.
aiTelemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('AiTelemetry', aiTelemetrySchema);
