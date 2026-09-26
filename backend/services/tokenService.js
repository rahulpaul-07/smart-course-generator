/**
 * Token service: short-lived access JWTs + rotating, revocable refresh tokens.
 *
 * Access token  — JWT, TTL = ACCESS_TOKEN_TTL (default 30m), sent as Bearer.
 * Refresh token — opaque random string, stored only as a SHA-256 hash, TTL =
 *                 REFRESH_TOKEN_TTL_DAYS (default 30), rotated on every use with
 *                 reuse detection.
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "30m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
// How long after a rotation the old value is still accepted from a parallel
// request. Long enough for tabs racing on wake-up, far too short to be useful
// to someone replaying a stolen token.
const ROTATION_GRACE_MS = 10 * 1000;

function signAccessToken(userId) {
  return jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: "HS256",
  });
}

function generateRefreshValue() {
  return crypto.randomBytes(40).toString("hex");
}

function hashToken(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function refreshExpiryDate() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** Create and persist a new refresh token (optionally within an existing family). */
async function issueRefreshToken(userId, family = null) {
  const value = generateRefreshValue();
  await persistRefreshToken(userId, value, family);
  return value;
}

async function persistRefreshToken(userId, value, family = null) {
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(value),
    family: family || randomUUID(),
    expiresAt: refreshExpiryDate(),
  });
}

/**
 * Validate + rotate a refresh token.
 * @returns {Promise<{ userId: string, refreshValue: string }>}
 * @throws  Error with status 401 on invalid/expired/reused tokens.
 */
async function rotateRefreshToken(oldValue) {
  const unauthorized = (msg) => Object.assign(new Error(msg), { status: 401 });
  if (!oldValue) throw unauthorized("Missing refresh token");

  const tokenHash = hashToken(oldValue);
  const now = new Date();

  // Claim the token atomically: of two concurrent requests presenting the same
  // value, exactly one flips `revoked`. A read-then-save let both succeed and
  // fork the family into two live tokens. The successor's hash is written in
  // the same update, so a parallel request can tell rotation from logout.
  const successor = generateRefreshValue();
  const claimed = await RefreshToken.findOneAndUpdate(
    { tokenHash, revoked: false, expiresAt: { $gt: now } },
    { $set: { revoked: true, revokedAt: now, replacedByHash: hashToken(successor) } },
    { returnDocument: "after" }
  );

  if (claimed) {
    await persistRefreshToken(claimed.user, successor, claimed.family);
    return { userId: String(claimed.user), refreshValue: successor };
  }

  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) throw unauthorized("Invalid refresh token");
  if (record.expiresAt.getTime() <= now.getTime()) throw unauthorized("Refresh token expired");

  // Rotated moments ago by a parallel request (two tabs waking together): not
  // theft, so continue the family instead of revoking it and logging the
  // user out everywhere.
  const rotatedAt = record.revokedAt?.getTime() ?? 0;
  if (record.replacedByHash && now.getTime() - rotatedAt <= ROTATION_GRACE_MS) {
    const newValue = await issueRefreshToken(record.user, record.family);
    return { userId: String(record.user), refreshValue: newValue };
  }

  // Reuse detection: a revoked token being presented means it (or its
  // successor) leaked. Kill the entire family and force re-login.
  await RefreshToken.updateMany({ family: record.family }, { $set: { revoked: true } });
  throw unauthorized("Refresh token reuse detected");
}

/** Revoke a single refresh token (logout on this device). */
async function revokeRefreshToken(value) {
  if (!value) return;
  await RefreshToken.updateOne({ tokenHash: hashToken(value) }, { $set: { revoked: true } });
}

/** Revoke every refresh token for a user (logout everywhere / password change). */
async function revokeAllForUser(userId) {
  await RefreshToken.updateMany({ user: userId, revoked: false }, { $set: { revoked: true } });
}

module.exports = {
  signAccessToken,
  generateRefreshValue,
  hashToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_DAYS,
};
