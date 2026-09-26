# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Submission-readiness audit
- **Sessions:** the SPA now calls the API same-origin (`/api`, proxied by Vercel and Vite). The refresh cookie never reached the cross-site API, so sessions ended at access-token expiry. Requests are Bearer-only (no access-token cookie); refresh rotation is atomic with a 10 s grace for parallel tabs.
- **Authorization:** another user's lesson now returns 403/404 instead of 500 (the error handler ignored `err.statusCode`). ObjectId validation now actually runs (`router.param`; the `router.use` version never saw route params).
- **Certificates:** a failed attempt no longer returns the exact score (it let the answer key be recovered one flip at a time), and attempts are capped per account.
- **Security hardening:** CSP and related headers on the SPA; per-account login limit and a global cap on guest creation (IP limits can be sidestepped); `TRUST_PROXY_HOPS`; guests can't appear on public pages; https-only avatars; bounded profile fields and chat transcripts; validated `x-trace-id`; Google sign-in fails closed without a valid client ID; expired local tokens are no longer forwarded to Auth0; public router status reports failure categories, not raw provider errors; hourly AI budget applied to interviews, agents and roadmaps.
- **Operations:** logs go to stdout (production logs were written only to files on the ephemeral disk); the API refuses to start in production without `MONGO_URI`; audits are blocking in CI for both packages; backend coverage floor in CI.
- **Removed:** Imagen banner generation (a paid call per course, stored as base64 in Mongo and never shown); the unreachable Hinglish audio feature and the unofficial `google-tts-api` dependency; duplicate `/collab/profile` and `/api/health` routes; unused schemas, RBAC middleware and `nginx.conf`.
- **UI:** landing and auth pages rebuilt without the stock effects (glow, dot grid, shimmer, border beams, marquee, animated counters, gradient serif accents). The router status dot reflects `/api/ai/status` instead of always showing green. The streaming demo is labelled as a scripted replay; the eval page states when results come from mock mode. App-wide: solid surfaces instead of glass, no hover-lift, token contrast raised to WCAG AA (inputs, muted text, primary), framer-motion honours reduced motion, fabricated fallbacks removed (a "12 lessons" default, a generic course description). Engineering pages moved to their own nav group, login returns you to the page you came from, and public profiles open without an account.
- **Tests:** backend regression suite for all of the above; frontend tests for error parsing, router status and the mock-mode note; E2E for session refresh through the proxy, return-to-page, no CSP violations, and phone layouts of signed-in pages.

### UI audit (every page, desktop and phone)
- Interview session rebuilt: four squeezed columns became a compact session header with tabs and timer, a wide question area and the coach panel. Code blocks scroll instead of clipping, the editor keeps Tab, languages are detected (a SQL question was labelled JavaScript), and one submit bar with per-section progress is reachable from every tab (it only existed on the MCQ tab).
- Fixed horizontal overflow on phones on the dashboard, course, roadmap, analytics and profile pages (grid items now shrink to their track).
- Removed nested interactive elements (buttons inside buttons) on the interview list and roadmap pages; delete controls are now reachable by touch and keyboard.
- One consistent page header across the app; the leaderboard kept its title when empty.
- Roadmaps open the most recent plan; the close-form control is no longer a trash icon.
- Guests are offered "save your account" instead of a Publish button that could only fail.
- Generated course covers replace random stock photos; finished lessons show a slim regenerate bar instead of a full card; inline code no longer shows literal backticks; lesson view no longer double-scrolls under the guest banner.
- E2E now covers the interview session at laptop width.


### Security
- Auth0 identities without a verified email can no longer sign in as, or link to, an existing account (a missing email claim matched the first user in the database).
- Public activity feed limited to public profiles and display fields.
- XP awards are idempotent per resource; quiz results from the client are clamped.

### Added
- Redesigned landing page, auth pages, brand mark, favicon and OG image.
- One-click guest accounts (`DEMO_MODE`), upgradeable in place via `/save-account`.
- Public `/status` (AI router) and `/evals` pages.
- `npm run dev:memory`: zero-setup backend on in-memory MongoDB with showcase content.
- Playwright E2E against the real API, now a blocking CI job.

### Fixed
- Community templates returned 500 once any public course existed (cache cloning Mongoose documents).
- Stored code answers HTML-escaped by `xss-clean` (removed).
- Mixed-case emails unable to log in; streaming requests not refreshing expired tokens; "session expired" toast for anonymous visitors; SSE streams dropped by idle proxies.
- Dashboard completion is lesson-level; dashboard queries parallelised and aggregated.

### Changed
- Initial JS reduced from 227 KB to 181 KB gzipped; Auth0 and Google SDKs load only when configured.
- See `docs/AUDIT-2026-09.md` (second pass) for the full write-up.


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
