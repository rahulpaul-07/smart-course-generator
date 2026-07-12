/**
 * Pluggable text embedder.
 *
 * Default: a zero-dependency, deterministic hashed bag-of-words embedder.
 * It needs no API key, runs offline, and is good enough to demonstrate and
 * unit-test semantic retrieval. For production-grade semantics, set
 * EMBEDDINGS_PROVIDER=openai and OPENAI_API_KEY, and this module will defer
 * to a real embedding model instead.
 */
const DIM = 256;

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// FNV-1a hash → bucket index, keeps the embedder deterministic and dependency-free.
function hashToken(token) {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % DIM;
}

function l2normalize(vec) {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => v / norm);
}

/** Local, deterministic embedding. */
function embedLocal(text) {
  const vec = new Array(DIM).fill(0);
  for (const token of tokenize(text)) vec[hashToken(token)] += 1;
  return l2normalize(vec);
}

/** Public API: returns a Promise<number[]> so a real async provider can drop in. */
async function embed(text) {
  if (process.env.EMBEDDINGS_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    // Real provider path. Imported lazily so the local path stays dependency-free.
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.embeddings.create({
      model: process.env.EMBEDDINGS_MODEL || "text-embedding-3-small",
      input: String(text || "").slice(0, 8000),
    });
    return res.data[0].embedding;
  }
  return embedLocal(text);
}

function cosineSimilarity(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return dot; // vectors are L2-normalized, so dot == cosine
}

module.exports = { embed, embedLocal, cosineSimilarity, DIM };
