# 10-Minute Technical Walkthrough

*Objective: Demonstrate technical depth, architectural decisions, and production-readiness to engineering managers.*

## 1. Introduction (2 mins)
- Briefly state the problem: Static learning platforms don't adapt to individual learning speeds.
- State the solution: A dynamic, AI-orchestrated platform.
- **Key Technical Highlight**: Built as a Monolithic Node.js/Express backend to prioritize iteration speed, utilizing React on the frontend for immediate UI reactivity.

## 2. Deep Dive: AI Orchestration & Fallbacks (3 mins)
- Open `backend/services/aiRouter.js`.
- Explain the biggest challenge: "LLM APIs go down or rate limit frequently."
- **How I solved it**: "I built a custom AI Router. Every request attempts Gemini first. If it fails or times out, it transparently falls back to OpenRouter, and then to Groq. This ensures 99.9% uptime for course generation, a critical business metric."
- Explain the prompt engineering: "I heavily structured the system prompts to return strictly validated JSON, forcing the LLM to categorize content into `blocks` (headings, code, callouts) rather than raw Markdown, which makes frontend rendering highly customizable."

## 3. Streaming and Performance (2 mins)
- Demonstrate the streaming lesson endpoint (`enrichLessonStream`).
- Explain the UX necessity: "Waiting 30 seconds for an LLM to write a 2,000-word lesson is unacceptable UX."
- **How I solved it**: "I implemented Server-Sent Events (SSE). The backend processes the lesson in chunks (Introduction -> Body -> Conclusion). As soon as the first chunk is parsed, it's streamed to the client. First-byte latency dropped from 25 seconds to under 2 seconds."

## 4. Production Engineering & Security (2 mins)
- Open `backend/server.js` and `backend/middlewares/`.
- Highlight security layers: "I didn't just build a prototype. I fortified it. Zod handles strict payload validation. Helmet secures HTTP headers. Express-Mongo-Sanitize prevents injection attacks. And I implemented targeted rate limiters—for instance, the AI generation endpoint allows far fewer requests per hour than the community endpoints to prevent API billing abuse."

## 5. Conclusion (1 min)
- Show the CI/CD pipeline (`.github/workflows/ci.yml`) and integration tests.
- "The platform is fully deployable, tested, and guarded against common web vulnerabilities, proving it's ready to scale to real users."
