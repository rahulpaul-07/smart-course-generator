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

    // Desperate fallback: If all keys are exhausted, just pick one at random anyway
    console.warn(`[KeyManager] All keys for ${this.envKeyName} are exhausted. Falling back to random key.`);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  markExhausted(key) {
    if (key) {
      this.cooldowns.set(key, Date.now() + this.cooldownDuration);
      console.warn(`[KeyManager] Key starting with ${key.substring(0, 5)}... put on cooldown for ${this.cooldownDuration / 1000}s`);
    }
  }
}

module.exports = KeyManager;
