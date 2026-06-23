class KeyManager {
  constructor(envKeyName) {
    this.envKeyName = envKeyName;
    this.cooldowns = new Map(); // apiKey -> timestamp of when it becomes available
    this.cooldownDuration = 60 * 1000; // 1 minute cooldown
  }

  getKey() {
    const keysStr = process.env[this.envKeyName] || "";
    const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
    
    if (keys.length === 0) return undefined;

    const now = Date.now();
    const availableKeys = keys.filter(k => {
      const cooldown = this.cooldowns.get(k);
      return !cooldown || cooldown < now;
    });

    if (availableKeys.length > 0) {
      return availableKeys[Math.floor(Math.random() * availableKeys.length)];
    }

    // If all keys are exhausted, throw structured cooldown response
    let minWaitMs = this.cooldownDuration;
    for (const key of keys) {
      const cd = this.cooldowns.get(key) || 0;
      const wait = cd - now;
      if (wait > 0 && wait < minWaitMs) {
        minWaitMs = wait;
      }
    }
    
    const err = new Error(`AI rate limit reached. Please wait a few seconds and try again.`);
    err.status = 429;
    err.retryAfterSeconds = Math.ceil(minWaitMs / 1000);
    throw err;
  }

  markExhausted(key) {
    if (key) {
      this.cooldowns.set(key, Date.now() + this.cooldownDuration);
      console.warn(`[KeyManager] Key starting with ${key.substring(0, 5)}... put on cooldown for ${this.cooldownDuration / 1000}s`);
    }
  }
}

module.exports = KeyManager;
