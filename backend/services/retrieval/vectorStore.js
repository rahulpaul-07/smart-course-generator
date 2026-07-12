/**
 * Minimal in-memory vector store with cosine-similarity search.
 *
 * This is intentionally storage-agnostic: the same `search()` contract can be
 * backed by MongoDB Atlas Vector Search in production (see atlasStore stub in
 * docs/architecture/ai.md). In-memory keeps the demo and tests self-contained.
 */
const { embed, cosineSimilarity } = require("./embedder");

class InMemoryVectorStore {
  constructor() {
    this.records = []; // { id, text, metadata, vector }
  }

  async add({ id, text, metadata = {} }) {
    const vector = await embed(text);
    this.records.push({ id, text, metadata, vector });
    return id;
  }

  async addMany(items) {
    for (const item of items) await this.add(item);
    return this.records.length;
  }

  async search(query, k = 3) {
    if (this.records.length === 0) return [];
    const qVec = await embed(query);
    return this.records
      .map((r) => ({ ...r, score: cosineSimilarity(qVec, r.vector) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ id, text, metadata, score }) => ({ id, text, metadata, score }));
  }

  get size() {
    return this.records.length;
  }
}

module.exports = { InMemoryVectorStore };
