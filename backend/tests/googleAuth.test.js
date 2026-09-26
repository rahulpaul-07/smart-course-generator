const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { OAuth2Client } = require("google-auth-library");
const app = require("../server");
const User = require("../models/User");

/**
 * Google sign-in, verified end to end through google-auth-library.
 *
 * ID tokens are signed here with a throwaway RSA key, and only the network
 * fetch of Google's public certificates is stubbed to return that key. The
 * signature, issuer, expiry and -- the point of these tests -- audience checks
 * all run in the real library, not in a mock.
 */
const CLIENT_ID = "123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com";
const OTHER_CLIENT_ID = "987654321098-zyxwvutsrqponmlkjihgfedcba543210.apps.googleusercontent.com";
const KID = "test-key";

const signingKey = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicPem = signingKey.publicKey.export({ type: "spki", format: "pem" });

function googleIdToken({ audience = CLIENT_ID, privateKey = signingKey.privateKey, ...claims } = {}) {
  return jwt.sign(
    {
      iss: "https://accounts.google.com",
      aud: audience,
      sub: "google-user-1",
      email: "learner@gmail.com",
      email_verified: true,
      name: "Google Learner",
      picture: "https://lh3.googleusercontent.com/a/photo",
      ...claims,
    },
    privateKey.export({ type: "pkcs8", format: "pem" }),
    { algorithm: "RS256", keyid: KID, expiresIn: "10m" }
  );
}

describe("POST /api/auth/google", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  let certsSpy;

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
    certsSpy = jest
      .spyOn(OAuth2Client.prototype, "getFederatedSignonCertsAsync")
      .mockResolvedValue({ certs: { [KID]: publicPem }, format: "PEM" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  });

  it("signs in with a valid token issued for the configured client ID", async () => {
    const token = googleIdToken();
    const res = await request(app).post("/api/auth/google").send({ token });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("learner@gmail.com");
    expect(res.body.token).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain(token);

    const user = await User.findOne({ email: "learner@gmail.com" }).lean();
    expect(user.googleId).toBe("google-user-1");
  });

  it("rejects a valid token issued for a different client ID", async () => {
    const token = googleIdToken({ audience: OTHER_CLIENT_ID });
    const res = await request(app).post("/api/auth/google").send({ token });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("Invalid Google token");
    expect(JSON.stringify(res.body)).not.toContain(token);
    expect(await User.countDocuments()).toBe(0);
  });

  it("rejects a token whose signature was not made by Google's key", async () => {
    const forger = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
    const token = googleIdToken({ privateKey: forger.privateKey });
    const res = await request(app).post("/api/auth/google").send({ token });

    expect(res.statusCode).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain(token);
    expect(await User.countDocuments()).toBe(0);
  });

  it.each([
    ["not a JWT", "not-a-jwt"],
    ["undecodable segments", "aaa.bbb.ccc"],
  ])("rejects a malformed token (%s)", async (_label, token) => {
    const res = await request(app).post("/api/auth/google").send({ token });

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("Invalid Google token");
    expect(JSON.stringify(res.body)).not.toContain(token);
  });

  it("still rejects a Google account whose email is not verified", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ token: googleIdToken({ email_verified: false }) });

    expect(res.statusCode).toBe(401);
    expect(await User.countDocuments()).toBe(0);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["a placeholder", "dummy_client_id"],
    ["not a Google client ID", "my-app.example.com"],
  ])("fails closed when GOOGLE_CLIENT_ID is %s", async (_label, value) => {
    if (value === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = value;
    const verifySpy = jest.spyOn(OAuth2Client.prototype, "verifyIdToken");

    const res = await request(app).post("/api/auth/google").send({ token: googleIdToken() });

    expect(res.statusCode).toBe(404);
    expect(verifySpy).not.toHaveBeenCalled();
    expect(certsSpy).not.toHaveBeenCalled();
    expect(await User.countDocuments()).toBe(0);

    const config = await request(app).get("/api/auth/config");
    expect(config.body.google).toBe(false);
  });

  it("reports Google sign-in as available only when the client ID is valid", async () => {
    const res = await request(app).get("/api/auth/config");
    expect(res.body.google).toBe(true);
  });
});
