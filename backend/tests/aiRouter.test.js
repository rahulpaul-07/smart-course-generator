// Unit tests for the AI fallback router. Providers are fully mocked so we can
// assert failover order, retry-with-backoff, and non-retryable short-circuiting
// without any network or real LLM calls.

jest.mock("../services/geminiService", () => ({
  generateJson: jest.fn(), generateJsonStream: jest.fn(),
  generateText: jest.fn(), generateTextStream: jest.fn(),
}));
jest.mock("../services/groqService", () => ({
  generateJson: jest.fn(), generateJsonStream: jest.fn(),
  generateText: jest.fn(), generateTextStream: jest.fn(),
}));
jest.mock("../services/openrouterService", () => ({
  generateJson: jest.fn(), generateJsonStream: jest.fn(),
  generateText: jest.fn(), generateTextStream: jest.fn(),
}));
// Telemetry is a fire-and-forget side effect; mock it so tests need no DB.
jest.mock("../models/AiTelemetry", () => ({ create: jest.fn().mockResolvedValue({}) }));

const gemini = require("../services/geminiService");
const groq = require("../services/groqService");
const openrouter = require("../services/openrouterService");
const breaker = require("../services/circuitBreaker");
const router = require("../services/aiRouter");

const httpError = (status, msg = "err") => Object.assign(new Error(msg), { status });

describe("aiRouter failover", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    breaker.reset();
    process.env.GEMINI_API_KEY = "k-gemini";
    process.env.GROQ_API_KEY = "k-groq";
    process.env.OPENROUTER_API_KEY = "k-openrouter";
  });

  it("fails over to the next provider when the first returns a non-retryable error (no retry)", async () => {
    gemini.generateJson.mockRejectedValue(httpError(400, "bad request"));
    groq.generateJson.mockResolvedValue({ ok: true, from: "groq" });

    const result = await router.generateJson("sys", "user");

    expect(result).toEqual({ ok: true, from: "groq" });
    expect(gemini.generateJson).toHaveBeenCalledTimes(1); // 400 is non-retryable → no retry
    expect(groq.generateJson).toHaveBeenCalledTimes(1);
  });

  it("retries the same provider on a retryable error, then fails over", async () => {
    gemini.generateJson.mockRejectedValue(httpError(429, "rate limited"));
    groq.generateJson.mockResolvedValue({ ok: true, from: "groq" });

    const result = await router.generateJson("sys", "user");

    expect(result).toEqual({ ok: true, from: "groq" });
    expect(gemini.generateJson).toHaveBeenCalledTimes(2); // retry path is now live
    expect(groq.generateJson).toHaveBeenCalledTimes(1);
  }, 20000);

  it("throws a friendly error when every provider is exhausted", async () => {
    gemini.generateJson.mockRejectedValue(httpError(500));
    groq.generateJson.mockRejectedValue(httpError(500));
    openrouter.generateJson.mockRejectedValue(httpError(500));

    await expect(router.generateJson("sys", "user")).rejects.toThrow(
      /temporarily busy/i
    );
  }, 30000);

  it("skips a provider whose circuit breaker is open", async () => {
    // Force gemini's breaker open.
    breaker.onFailure("gemini");
    breaker.onFailure("gemini");
    breaker.onFailure("gemini");
    groq.generateJson.mockResolvedValue({ ok: true, from: "groq" });

    const result = await router.generateJson("sys", "user");

    expect(result).toEqual({ ok: true, from: "groq" });
    expect(gemini.generateJson).not.toHaveBeenCalled(); // skipped while open
  });
});
