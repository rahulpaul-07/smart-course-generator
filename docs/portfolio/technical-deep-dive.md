# Technical Deep Dive: The AI Router & Orchestration

*Be prepared to draw or explain this deeply if pressed by a Senior Engineer.*

## The Problem
Directly connecting a frontend to OpenAI or Gemini via simple REST calls is dangerous. Keys leak, payloads aren't strictly validated, latency is unpredictable, and API outages cause complete product downtime.

## The CourseAI Pro Solution
The backend monolith acts as a secure, orchestrating proxy.

### 1. The Gateway
The frontend requests a lesson generation via POST. Before the request ever touches business logic, it hits:
1. **Helmet**: Securing HTTP.
2. **Express Rate Limiter**: Rejecting spam.
3. **Zod**: Ensuring the body contains `{ courseId, lessonId, prompt }` in exact types.
4. **Auth Middleware**: Validating the user's JWT.

### 2. The Context Engine
The `LessonGenerationService` doesn't just pass the prompt. It pulls the specific Course Outline from MongoDB. It builds a System Prompt injecting: "You are an expert tutor. You are currently teaching [Module 2, Lesson 1]. The overall course is [Course Title]." This bounds the LLM and prevents generic answers.

### 3. The Orchestration Router
Instead of `await gemini.generate()`, the system calls `aiRouter.generateStrictJSON(prompt, schema)`.
The router maintains an array of providers. It executes a `try/catch` loop over the providers. If the primary errors out, it attempts the secondary.

### 4. The Real-Time SSE Stream
While the LLM is generating, the Node.js backend opens a persistent HTTP connection using `Content-Type: text/event-stream`. As the LLM completes "chunks" (paragraphs or code blocks), the backend immediately flushes that buffer to the client, allowing the React UI to aggressively paint the screen.

### 5. The Persistence
Once the stream concludes naturally, the backend coalesces the chunks into a final Document and persists it to MongoDB Atlas, ensuring the user can revisit the lesson instantly via the Node-Cache layer in the future without re-generating.
