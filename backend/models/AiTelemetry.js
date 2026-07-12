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
