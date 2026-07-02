# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-20

### Added
- **Multi-Agent AI Router:** Custom fallback orchestration (Gemini, Groq, OpenRouter) replacing LangChain.
- **Server-Sent Events (SSE):** Real-time markdown streaming to drastically reduce TTFB.
- **Adaptive Difficulty:** Dynamic prompt mutation based on user study analytics and quiz performance.
- **Community Hub:** Public profiles, course cloning, upvoting, and an automated global Leaderboard.
- **Study Mechanics:** Integrated Flashcards, Practice Labs, and Interview Prep modes.
- **Enterprise Security:** Auth0 JWT validation, rate limiting, Winston logging, and UUIDv4 tracing.
- **Dockerization:** Full `docker-compose.yml` for isolated frontend/backend container builds.

### Changed
- Monolithic migration completed: Unified 3 separate codebases into a single seamless repository.
- Migrated out of WebSockets to SSE for the course generation loop to prevent massive server state overhead.
