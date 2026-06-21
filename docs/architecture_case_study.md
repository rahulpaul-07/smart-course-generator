# Architecture Case Study

## High-Level System Architecture

The Unified Course Platform employs a decoupled client-server architecture designed for elasticity and high throughput AI operations.

### 1. Frontend (React 18 + Vite)
- **State Management:** React Context API encapsulates Authentication, eliminating prop drilling while avoiding the overhead of Redux.
- **Routing:** React Router DOM with asynchronous `lazy` loading boundaries ensuring initial bundle sizes remain below 150kb.
- **Resilience:** React Error Boundaries capture unexpected rendering exceptions, falling back to a structured crash UI instead of a white screen.

### 2. Backend (Node.js + Express)
- **Stateless API:** The Express server holds no session state. Authentication relies purely on RS256 JWTs verified against Auth0 JWKS endpoints.
- **Middleware Pipeline:**
  - `Request Tracing`: Injects UUIDv4 into every incoming HTTP request header.
  - `Rate Limiting`: 100 req/15min globally, 20 req/1hr for heavy LLM compute endpoints.
  - `Logging`: Winston + Morgan intercepts and serializes request paths, status codes, and execution times to physical logs.

### 3. AI Orchestration Layer (`aiRouter.js`)
- **Multi-Model Fallback:** A prioritized array of models (Llama 3 70B -> Mixtral -> Gemini Flash -> Llama 3 8B) ensures 99.9% uptime. If Groq rate limits, it fails over to OpenRouter, then to Google.
- **Custom Agentic Framework:** Instead of relying on bloated libraries like LangChain, we utilize a custom orchestration module (`agents/index.js`). This executes predefined persona prompts (Reviewer, Coach, Planner) cleanly and synchronously.

### 4. Database (MongoDB)
- Data models are heavily normalized where appropriate, using ObjectIds (e.g., `Course` references `User`, `Lesson` references `Course`). 
- Indexes are strictly applied on frequently queried fields (`creator`, `shareId`) to ensure `O(log n)` lookups.
