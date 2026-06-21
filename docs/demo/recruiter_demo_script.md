# Recruiter Demo Script

**Target Audience:** Hiring Managers, Technical Recruiters, Engineering Managers.
**Duration:** ~2 minutes

## 1. The Hook (0:00 - 0:30)
- **Action:** Show the Architecture Diagram.
- **Script:** "I built the Unified Course Platform as a monolithic Node/React application that scales like microservices. My primary goal was to solve the latency and hallucination problems typical of LLM wrappers."

## 2. Engineering Depth (0:30 - 1:15)
- **Action:** Open the AI Agents Hub.
- **Script:** "Instead of using bloated frameworks like LangChain, I built a custom routing layer. The system uses a Multi-Agent approach: a Course Reviewer, a Learning Coach, and a Revision Planner. They run in parallel to ensure high-quality output. I implemented Server-Sent Events (SSE) to stream the UI, dropping TTFB (Time to First Byte) to under 2 seconds."

## 3. Enterprise Readiness (1:15 - 2:00)
- **Action:** Show the network tab or logs.
- **Script:** "The backend is fully stateless, secured by Auth0 RS256 JWTs. It features UUIDv4 request tracing, Winston error logging, and Redis-ready rate limiting. The entire stack is Dockerized with GitHub Actions CI/CD pipelines ready for Kubernetes or AWS deployment."
