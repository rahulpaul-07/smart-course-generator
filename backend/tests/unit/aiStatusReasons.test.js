const { publicReason } = require("../../controllers/aiStatusController");

describe("public AI status failure reasons", () => {
  it.each([
    ["404 models/gemini-1.0 does not exist", "model_not_found"],
    ["Request timed out after 30000ms", "timeout"],
    ["429 Resource has been exhausted (e.g. check quota) for project 1234", "rate_limited"],
    ["401 Incorrect API key provided: sk-abc***", "auth_error"],
    ["Model returned invalid JSON", "invalid_output"],
    ["503 Service Unavailable", "server_error"],
    ["fetch failed: ECONNRESET", "network_error"],
    ["something unexpected", "error"],
  ])("classifies %j as %s", (raw, expected) => {
    expect(publicReason(raw)).toBe(expected);
  });

  it("never echoes provider text", () => {
    const raw = "401 Incorrect API key provided: sk-live-123456 for org org-abc";
    expect(publicReason(raw)).not.toContain("sk-");
  });

  it("returns null when there is no reason", () => {
    expect(publicReason(null)).toBeNull();
    expect(publicReason("")).toBeNull();
  });
});
