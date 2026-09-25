/**
 * Regressions for the September 2026 production outage: Groq retired both
 * hardcoded Llama models and every Gemini call hit a 20s timeout.
 */
function loadModels(env = {}) {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, env);
  const mod = require("../../services/aiModels");
  process.env = saved;
  return mod;
}

describe("aiModels", () => {
  test("defaults no longer point at models Groq shut down on 2026-08-16", () => {
    const { MODELS } = loadModels();
    expect(Object.values(MODELS)).not.toContain("llama-3.3-70b-versatile");
    expect(Object.values(MODELS)).not.toContain("llama-3.1-8b-instant");
  });

  test("every model is overridable from the environment", () => {
    const { MODELS } = loadModels({ GROQ_MODEL: "qwen/qwen3.8-27b", GEMINI_MODEL: "gemini-3-flash" });
    expect(MODELS.groq).toBe("qwen/qwen3.8-27b");
    expect(MODELS.gemini).toBe("gemini-3-flash");
  });

  test("timeout leaves room for a full outline (was 20s)", () => {
    expect(loadModels().AI_TIMEOUT_MS).toBeGreaterThanOrEqual(45000);
  });

  test("Gemini Flash skips thinking for structured output; Pro keeps its default", () => {
    const { geminiThinkingConfig } = loadModels();
    expect(geminiThinkingConfig("gemini-2.5-flash")).toEqual({ thinkingConfig: { thinkingBudget: 0 } });
    expect(geminiThinkingConfig("gemini-2.5-pro")).toEqual({});
  });

  test("gpt-oss models get low reasoning effort; others get nothing extra", () => {
    const { groqModelOptions } = loadModels();
    expect(groqModelOptions("openai/gpt-oss-120b")).toEqual({ reasoning_effort: "low" });
    expect(groqModelOptions("qwen/qwen3.8-27b")).toEqual({});
  });
});

describe("router retry policy", () => {
  const { shouldRetry } = require("../../services/aiRouter")._internal;

  test("a retired model (404 model_not_found) fails over instead of retrying", () => {
    expect(shouldRetry({ status: 404, message: "404 model_not_found" })).toBe(false);
    expect(shouldRetry(new Error("The model `x` does not exist or you do not have access to it."))).toBe(false);
  });

  test("timeouts and 5xx are still retried", () => {
    expect(shouldRetry(new Error("Request timed out"))).toBe(true);
    expect(shouldRetry({ status: 503, message: "unavailable" })).toBe(true);
  });
});
