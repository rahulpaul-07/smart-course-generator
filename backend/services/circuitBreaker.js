/**
 * Lightweight in-memory circuit breaker for AI providers.
 *
 * States per provider key:
 *   closed    - requests flow normally
 *   open      - provider is skipped until the cooldown elapses
 *   half-open - after cooldown, one probe is allowed; success closes it,
 *               failure re-opens it.
 *
 * This complements KeyManager (which handles per-API-key cooldowns) by
 * tracking provider-level health across requests, so a provider that is
 * hard-down is skipped instead of costing every request a full timeout.
 */
class CircuitBreaker {
  constructor({ threshold = 3, cooldownMs = 30_000 } = {}) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.state = new Map(); // key -> { failures, openedAt }
  }

  isOpen(key) {
    const s = this.state.get(key);
    if (!s || s.failures < this.threshold) return false;
    if (Date.now() - s.openedAt > this.cooldownMs) {
      // Transition to half-open: allow a single probe through.
      s.failures = this.threshold - 1;
      return false;
    }
    return true;
  }

  onSuccess(key) {
    this.state.set(key, { failures: 0, openedAt: 0 });
  }

  onFailure(key) {
    const s = this.state.get(key) || { failures: 0, openedAt: 0 };
    s.failures += 1;
    if (s.failures >= this.threshold) s.openedAt = Date.now();
    this.state.set(key, s);
  }

  /**
   * Current state of every provider the breaker has seen, for the status
   * endpoint. Read-only: derives the closed/open/half-open label rather than
   * calling isOpen(), because isOpen() has the side effect of transitioning a
   * cooled-down breaker to half-open, and reading a dashboard must not consume
   * the probe that a real request is entitled to.
   */
  snapshot() {
    const now = Date.now();
    const out = {};
    for (const [key, s] of this.state.entries()) {
      const cooledDown = now - s.openedAt > this.cooldownMs;
      let status = 'closed';
      if (s.failures >= this.threshold) status = cooledDown ? 'half-open' : 'open';
      else if (s.failures > 0) status = 'degraded';

      out[key] = {
        status,
        failures: s.failures,
        threshold: this.threshold,
        openedAt: s.openedAt ? new Date(s.openedAt).toISOString() : null,
        retryInMs: status === 'open' ? Math.max(0, this.cooldownMs - (now - s.openedAt)) : 0,
      };
    }
    return out;
  }

  /** Test helper: clear all breaker state. */
  reset() {
    this.state.clear();
  }
}

// Exported as a singleton so all AI calls share one health view.
module.exports = new CircuitBreaker();
