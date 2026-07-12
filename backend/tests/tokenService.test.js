const jwt = require("jsonwebtoken");

// Mock the RefreshToken model so requiring tokenService needs no DB. The DB-backed
// rotation/reuse logic is exercised by the auth route integration tests.
jest.mock("../models/RefreshToken", () => ({
  create: jest.fn().mockResolvedValue({}),
  findOne: jest.fn(),
  updateOne: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({}),
}));

const ORIGINAL_SECRET = process.env.JWT_SECRET;
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-chars-long!!";

const {
  signAccessToken,
  generateRefreshValue,
  hashToken,
} = require("../services/tokenService");

afterAll(() => { process.env.JWT_SECRET = ORIGINAL_SECRET; });

describe("tokenService crypto", () => {
  it("signs a verifiable, expiring access token", () => {
    const token = signAccessToken("user-123");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe("user-123");
    expect(decoded.exp).toBeGreaterThan(decoded.iat); // has an expiry
  });

  it("generates high-entropy, unique refresh values", () => {
    const a = generateRefreshValue();
    const b = generateRefreshValue();
    expect(a).toHaveLength(80); // 40 bytes hex
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]+$/);
  });

  it("hashes tokens deterministically and never stores plaintext", () => {
    const value = generateRefreshValue();
    expect(hashToken(value)).toBe(hashToken(value));
    expect(hashToken(value)).not.toBe(value);
    expect(hashToken(value)).toHaveLength(64); // sha256 hex
  });
});
