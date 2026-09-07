# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Layout:** unified five competing page-width systems behind one `PageContainer` primitive. Content edge no longer shifts 32px between routes; `.page-shell` now mirrors the same geometry.
- **Typography:** `prose-invert` was applied unconditionally, rendering lesson bodies, chat replies and interview feedback as near-white text on the light theme's near-white background. Now `dark:prose-invert`.
- **Code blocks:** `CodeSnippet` overwrote the `className` returned by `prism-react-renderer`, flattening syntax colouring, and spread a `key` into JSX.
- **AI router:** a transient provider outage on a Groq-only or OpenRouter-only deployment triggered the mock-response path, serving users fabricated placeholder course content. The mock path now depends on configuration only.
- **AI router:** client errors (400/401/403) and schema-validation failures no longer count against a provider's circuit breaker.
- **AI router:** `executeWithTimeout` leaked a timer and aborted healthy SSE streams 20s after they started.
- **AI router:** the all-breakers-open fallback no longer hardcodes Gemini on deployments without a Gemini key.
- **AI parsing:** `parseRobustJson` stripped code fences before trimming, so any response ending in a newline after the closing fence failed to parse.
- **Streaks:** consolidated two divergent copies into `services/streakService.js`, switched from UTC days to timezone-aware local days, and added a persisted `longestStreak` (the dashboard previously reported the current streak under that label).
- **XP:** awards now use an atomic `$inc`; concurrent activities were losing XP to read-modify-write. Badge unlocks use a guarded `$push`.
- **Search:** the dashboard search box dropped every other query param and pushed a history entry per keystroke.
- **API client:** the axios interceptor threw a `TypeError` on non-object error bodies (Render cold-start HTML, empty 204s), masking the real error.
- **API client:** the axios dedup lock and the SSE generation lock shared one `sessionStorage` key with incompatible value shapes.
- **Hooks:** `useAutoScroll` did not follow incoming messages; `useClipboard` failed in insecure contexts; `useInterviewTimer` drifted on every refetch.

### Changed
- **Tests:** split into `test:unit` (no database, no network, 25 tests in ~1.7s) and `test:integration` (mongodb-memory-server). CI runs them as separate steps.
- Added `docs/AUDIT-2026-09.md` documenting every defect found, why it mattered, and what remains known-but-unfixed.

### Removed
- **Docker:** dropped `docker-compose.yml`, both Dockerfiles, and the Docker-image CI check in favor of the split Vercel/Render deployment path, which is what the project actually ships on.

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
