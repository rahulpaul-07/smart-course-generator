# Interview Talking Points

Be prepared to answer these questions during a technical interview.

**1. "Why did you use Server-Sent Events instead of WebSockets?"**
*Answer Strategy:* Explain that WebSockets are stateful and bidirectional, which introduces massive overhead for a server. SSE is unidirectional (Server to Client) and operates over standard HTTP/2 multiplexed connections. Since course generation only requires the server to stream data to the client, SSE is the most efficient, lightweight, and scalable choice.

**2. "Why didn't you use LangChain?"**
*Answer Strategy:* Emphasize your desire to understand the underlying mechanics rather than relying on bloated abstractions. Mention that LangChain introduces heavy dependencies and makes debugging 429 Rate Limits very opaque. By writing a custom `aiRouter`, you maintained full control over the fallback cascade (Groq -> OpenRouter -> Google) with zero unnecessary overhead.

**3. "How did you structure your MongoDB schemas?"**
*Answer Strategy:* Discuss normalization vs. denormalization. Mention that you chose to reference ObjectIds (e.g., Lesson referencing Course, User referencing Certificate) to avoid massive, unbound document growth. Mention the use of `$inc` operators for upvotes and clones to avoid race conditions.

**4. "How did you handle security?"**
*Answer Strategy:* Mention that the server is completely stateless. You do not store passwords; you use Auth0 and verify the RS256 JWT signature cryptographically on every request using Auth0's JWKS endpoint. Furthermore, mention the `express-rate-limit` to prevent DDoS and LLM API bankruptcy.

**5. "What was the hardest bug you faced?"**
*Answer Strategy:* (Recommended) Discuss the challenge of merging 3 monolithic repositories into one, dealing with duplicate Mongoose schemas and conflicting React Router DOM paths, and how you engineered the `aiRouter` to solve the latency problems.
