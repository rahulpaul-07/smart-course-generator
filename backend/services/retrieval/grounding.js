/**
 * RAG grounding: retrieve authoritative snippets for a topic and turn them into
 * a prompt-injectable context block + citation list. Reduces hallucination by
 * grounding generation in a vetted corpus.
 *
 * Disabled by default. Enable with RAG_ENABLED=true so it never affects
 * existing behavior unless explicitly turned on.
 */
const fs = require("fs");
const path = require("path");
const { InMemoryVectorStore } = require("./vectorStore");

let storePromise = null;

function isEnabled() {
  return process.env.RAG_ENABLED === "true";
}

async function getStore() {
  if (!storePromise) {
    storePromise = (async () => {
      const store = new InMemoryVectorStore();
      const corpus = JSON.parse(
        fs.readFileSync(path.join(__dirname, "corpus.json"), "utf8")
      );
      await store.addMany(
        corpus.map((c) => ({
          id: c.id,
          text: c.text,
          metadata: { source: c.source, url: c.url },
        }))
      );
      return store;
    })();
  }
  return storePromise;
}

/**
 * @returns {Promise<{ contextText: string, citations: Array<{source,url}>, used: boolean }>}
 */
async function buildGroundedContext(topic, { k = 3, minScore = 0.05 } = {}) {
  if (!isEnabled() || !topic) return { contextText: "", citations: [], used: false };

  const store = await getStore();
  const hits = (await store.search(topic, k)).filter((h) => h.score >= minScore);
  if (hits.length === 0) return { contextText: "", citations: [], used: false };

  const contextText = [
    "Ground your explanation in these authoritative source excerpts.",
    "Do not contradict them. If they do not cover a claim, rely on well-established knowledge.",
    "",
    ...hits.map((h, i) => `[${i + 1}] (${h.metadata.source}) ${h.text}`),
  ].join("\n");

  const citations = hits.map((h) => ({ source: h.metadata.source, url: h.metadata.url }));
  return { contextText, citations, used: true };
}

// Test/ops helper: force store rebuild (e.g., after swapping corpus).
function _resetStore() {
  storePromise = null;
}

module.exports = { buildGroundedContext, isEnabled, _resetStore };
