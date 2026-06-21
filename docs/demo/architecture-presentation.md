# Architecture Presentation Guide

*Use this guide when walking an interviewer through the `docs/architecture/` diagrams.*

## 1. The Big Picture (System Architecture)
- Point out the **Load Balancer / Ingress**. Mention that SSL termination happens here.
- Explain the **Monolithic Node.js API**. Acknowledge that while microservices are trendy, a monolith is the correct architectural choice for a V1 product to maximize developer velocity and minimize deployment complexity.
- Point to **MongoDB**. Mention it's a NoSQL store, which is ideal here because AI-generated lesson content structures (which can have varying block types like code, lists, and callouts) are highly polymorphic and fit perfectly into flexible BSON documents rather than rigid SQL tables.

## 2. The Innovation (AI Routing)
- Bring up the **AI Router Flow**.
- Emphasize the concept of **Graceful Degradation**. "If our primary intelligence provider goes down, the application does not break. It seamlessly degrades to backup providers."
- Mention the **Context Management**. Explain how the AI Tutor gets injected with the *exact* lesson blocks the student is currently viewing to prevent irrelevant answers.

## 3. The Security & Reliability Posture (Backend Architecture)
- Detail the **Middleware Pipeline**.
- "Every request goes through Helmet for HTTP protections, rate limiters to prevent DDoS, and Zod validators to ensure the payload is exactly what we expect."
- Highlight the **Cache Middleware** protecting the database from read-heavy community traffic.

## 4. Summary
- "The architecture is designed to be **Resilient** (AI fallbacks), **Performant** (SSE streaming and heavy-read caching), and **Secure** (Strict validation and sanitization)."
