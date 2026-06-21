# Interview Discussion Guide (STAR Format)

*Use these structured stories when asked behavioral or technical deep-dive questions during an interview.*

## 1. Tell me about a time you had to deal with ambiguity.
* **Situation:** When building CourseAI Pro, I wanted to generate comprehensive 2,000+ word technical courses using an LLM. 
* **Task:** I didn't know how to guarantee the LLM would output content reliably in a format my React frontend could render interactively, rather than just returning a giant, un-parsable text block.
* **Action:** I researched JSON structuring for LLMs. I implemented a two-step generative flow. First, an outline generation prompt that locked the LLM into a specific JSON schema. Second, a chunk-by-chunk iteration loop that requested discrete JSON content blocks (like `MARKDOWN`, `CODE_SNIPPET`, `CALLOUT`).
* **Result:** The ambiguity of "raw text" was replaced by a rigid API contract. The React frontend now beautifully renders interactive blocks with 99% accuracy.

## 2. Tell me about a time you optimized performance.
* **Situation:** Initial course lesson generation took roughly 25 to 30 seconds for the LLM API to return the payload.
* **Task:** 30 seconds is an unacceptable wait time for modern web UX. I needed to reduce perceived latency.
* **Action:** I migrated the lesson generation endpoint from standard REST to Server-Sent Events (SSE). Instead of awaiting the full LLM completion, I hooked into the Node.js streams and pushed JSON blocks to the frontend the millisecond they finished parsing.
* **Result:** First-byte latency dropped from 25 seconds down to ~1.5 seconds. The user can start reading paragraph 1 while paragraph 10 is still being generated.

## 3. Tell me about a time you handled a failure state gracefully.
* **Situation:** During load testing, the primary LLM API (Google Gemini) hit rate limits and started returning 429 Too Many Requests errors.
* **Task:** The core product completely broke for users whenever the API went down.
* **Action:** I abstracted the LLM call into a centralized `AI Router`. I implemented a try-catch fallback waterfall. If Gemini failed, the router instantly requested the exact same prompt from OpenRouter, and if that failed, Groq. 
* **Result:** End users literally never see an LLM failure anymore. Uptime for the core generation engine skyrocketed to effectively 99.9%.
