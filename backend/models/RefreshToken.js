const mongoose = require("mongoose");

/**
 * Opaque refresh tokens, stored hashed (never in plaintext). Supports rotation
 * and reuse detection: tokens are grouped into a `family`; presenting an already
 * rotated/revoked token invalidates the whole family (probable theft).
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    replacedByHash: { type: String, default: null },
  },
  { timestamps: true }
);

// TTL index: expired refresh tokens are purged automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
