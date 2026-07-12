const { embedLocal, cosineSimilarity, DIM } = require("../services/retrieval/embedder");
const { InMemoryVectorStore } = require("../services/retrieval/vectorStore");
const grounding = require("../services/retrieval/grounding");

describe("embedder", () => {
  it("is deterministic and L2-normalized", () => {
    const a = embedLocal("binary search runs in logarithmic time");
    const b = embedLocal("binary search runs in logarithmic time");
    expect(a).toEqual(b);
    expect(a).toHaveLength(DIM);
    const norm = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it("scores related text higher than unrelated text", () => {
    const q = embedLocal("http get post methods");
    const related = embedLocal("the http get and post request methods");
    const unrelated = embedLocal("react hooks preserve state between renders");
    expect(cosineSimilarity(q, related)).toBeGreaterThan(cosineSimilarity(q, unrelated));
  });
});

describe("InMemoryVectorStore", () => {
  it("ranks the most relevant document first", async () => {
    const store = new InMemoryVectorStore();
    await store.addMany([
      { id: "a", text: "TCP three-way handshake SYN SYN-ACK ACK reliable delivery" },
      { id: "b", text: "React useState hook returns a value and a setter" },
      { id: "c", text: "Big-O notation asymptotic upper bound binary search" },
    ]);
    const results = await store.search("how does the tcp handshake work", 3);
    expect(results[0].id).toBe("a");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});

describe("grounding", () => {
  const original = process.env.RAG_ENABLED;
  afterEach(() => {
    process.env.RAG_ENABLED = original;
    grounding._resetStore();
  });

  it("returns empty (no-op) when RAG is disabled", async () => {
    delete process.env.RAG_ENABLED;
    grounding._resetStore();
    const out = await grounding.buildGroundedContext("json syntax rules");
    expect(out.used).toBe(false);
    expect(out.contextText).toBe("");
    expect(out.citations).toEqual([]);
  });

  it("retrieves grounded context + citations when RAG is enabled", async () => {
    process.env.RAG_ENABLED = "true";
    grounding._resetStore();
    const out = await grounding.buildGroundedContext("rules for valid JSON keys and values");
    expect(out.used).toBe(true);
    expect(out.contextText).toMatch(/JSON/i);
    expect(out.citations.length).toBeGreaterThan(0);
    expect(out.citations[0]).toHaveProperty("url");
  });
});
