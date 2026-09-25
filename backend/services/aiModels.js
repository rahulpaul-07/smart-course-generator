/**
 * Every model ID and AI timing knob in one place, overridable by environment.
 *
 * Providers retire models on their own schedule. Groq shut down
 * llama-3.3-70b-versatile and llama-3.1-8b-instant on 2026-08-16; both were
 * hardcoded here and in groqService, so production generation silently failed
 * with 404 model_not_found until a code change was deployed. Swapping a model
 * is now an environment change on Render, no deploy needed.
 * Check current IDs at https://console.groq.com/docs/deprecations.
 */
const env = (name, fallback) => (process.env[name] && process.env[name].trim()) || fallback;

const MODELS = {
  gemini: env("GEMINI_MODEL", "gemini-2.5-flash"),
  groq: env("GROQ_MODEL", "openai/gpt-oss-120b"),
  groqFast: env("GROQ_FAST_MODEL", "openai/gpt-oss-20b"),
  openrouter: env("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
  openrouterFallback: env("OPENROUTER_FALLBACK_MODEL", "openai/gpt-4o"),
};

/**
 * Per-attempt deadline. It was 20s, which a thinking model generating a whole
 * course outline routinely exceeds -- every Gemini call in production was
 * timing out at exactly 20,001 ms. SSE heartbeats keep the client connection
 * alive meanwhile.
 */
const AI_TIMEOUT_MS = Number(env("AI_TIMEOUT_MS", "45000"));

/**
 * Gemini 2.5 "thinks" by default, and thinking tokens count against
 * maxOutputTokens: slow, and able to truncate the JSON we asked for. Structured
 * generation doesn't need it, so Flash models default to a zero budget. Pro
 * models cannot disable thinking, so they are left on the model default.
 * Set GEMINI_THINKING_BUDGET to override (-1 = dynamic).
 */
function geminiThinkingConfig(model) {
  const raw = process.env.GEMINI_THINKING_BUDGET;
  if (raw !== undefined && raw !== "") return { thinkingConfig: { thinkingBudget: Number(raw) } };
  if (/flash/i.test(model) && /2\.5|[3-9]\./.test(model)) return { thinkingConfig: { thinkingBudget: 0 } };
  return {};
}

/** Groq request options that depend on the model family. */
function groqModelOptions(model) {
  // gpt-oss models reason before answering; "low" keeps latency close to the
  // old Llama models while still producing valid JSON.
  if (/^openai\/gpt-oss/.test(model)) return { reasoning_effort: env("GROQ_REASONING_EFFORT", "low") };
  return {};
}

module.exports = { MODELS, AI_TIMEOUT_MS, geminiThinkingConfig, groqModelOptions };
