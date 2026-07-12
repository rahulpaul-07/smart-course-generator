const breaker = require("../services/circuitBreaker");

describe("CircuitBreaker", () => {
  beforeEach(() => breaker.reset());

  it("stays closed below the failure threshold", () => {
    breaker.onFailure("gemini");
    breaker.onFailure("gemini");
    expect(breaker.isOpen("gemini")).toBe(false); // threshold is 3
  });

  it("opens after threshold consecutive failures", () => {
    breaker.onFailure("gemini");
    breaker.onFailure("gemini");
    breaker.onFailure("gemini");
    expect(breaker.isOpen("gemini")).toBe(true);
  });

  it("closes again on success", () => {
    breaker.onFailure("groq");
    breaker.onFailure("groq");
    breaker.onFailure("groq");
    expect(breaker.isOpen("groq")).toBe(true);
    breaker.onSuccess("groq");
    expect(breaker.isOpen("groq")).toBe(false);
  });

  it("half-opens after the cooldown window elapses", () => {
    const now = 1_000_000;
    const spy = jest.spyOn(Date, "now").mockReturnValue(now);
    breaker.onFailure("x");
    breaker.onFailure("x");
    breaker.onFailure("x");
    expect(breaker.isOpen("x")).toBe(true);
    spy.mockReturnValue(now + 31_000); // > 30s cooldown
    expect(breaker.isOpen("x")).toBe(false); // one probe allowed
    spy.mockRestore();
  });

  it("tracks providers independently", () => {
    breaker.onFailure("a");
    breaker.onFailure("a");
    breaker.onFailure("a");
    expect(breaker.isOpen("a")).toBe(true);
    expect(breaker.isOpen("b")).toBe(false);
  });
});
