<div align="center">

<img src="frontend/public/favicon.svg" width="56" alt="CourseAI logo" />

# CourseAI — Smart Course Generator

**Turn one sentence into a structured course, streamed lesson by lesson, then learn it properly with quizzes, flashcards, a per-lesson tutor and scored mock interviews.**

<a href="https://smart-course-generator.vercel.app/"><img src="https://img.shields.io/badge/Live_demo-no_sign--up-6d5dfc?style=for-the-badge" alt="Live demo" /></a>
<a href="https://github.com/rahulpaul-07/smart-course-generator/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/rahulpaul-07/smart-course-generator/ci.yml?style=for-the-badge&label=CI" alt="CI" /></a>
<a href="https://github.com/rahulpaul-07/smart-course-generator/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/rahulpaul-07/smart-course-generator/codeql.yml?style=for-the-badge&label=CodeQL" alt="CodeQL" /></a>
<img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript strict" />
<a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT" /></a>

[**Live demo**](https://smart-course-generator.vercel.app/) · [Router status](https://smart-course-generator.vercel.app/status) · [Eval results](https://smart-course-generator.vercel.app/evals) · [Architecture](./docs/architecture) · [Audit notes](./docs/AUDIT-2026-09.md)

<img src="docs/screenshots/landing.png" alt="CourseAI landing page with a live replay of streaming course generation" width="100%" />

</div>

> **Try it in one click.** Hit *"Try the demo, no sign-up"* on the landing page for a private guest account with a sample course already in it. The API runs on Render's free tier, so the first request after idling can take ~30–60 s to wake up.

---

## Why this project

Most "AI course generator" demos are a prompt and a text box. The hard part of an AI product is everything that happens when the model is **slow, wrong or down**, and that's where most of this codebase lives:

| Problem | What CourseAI does |
|---|---|
| Long generations block the UI | Courses and lessons stream over **Server-Sent Events** block by block, with heartbeats so proxies don't cut long streams. |
| One provider goes down | A custom **AI router** fails over across Gemini → Groq → OpenRouter with retry + exponential backoff, per-provider **circuit breakers**, key rotation and telemetry. Bad prompts don't count as outages. |
| "Is the output any good?" | Every generation is **schema-validated** before it is saved. An **eval harness** scores structure, subtopic coverage and LLM-as-judge faithfulness; CI runs it in mock mode as a contract check, and real quality scores need a provider key. Results are public at `/evals`, labelled with the mode they were recorded in. |
| Hallucinated facts | Optional **RAG grounding** retrieves vetted excerpts into lesson prompts (pluggable vector store). |
| Real users, real auth | Short-lived Bearer access tokens + a rotating httpOnly `SameSite=Strict` refresh token with **reuse detection**, served same-origin so the cookie actually reaches the API; verified-email-only account linking; schema validation at the API boundary. |
| Recruiters won't sign up | **Ephemeral guest accounts**: isolated per visitor, seeded with a course, purged after 24 h, and upgradable in place to a real account. |

## Features

- **Course generation.** Topic → modules → lessons → final test, in any language, streamed live.
- **Rich lessons.** Markdown, code with syntax highlighting, LaTeX math, callouts, embedded videos, PDF export, reading-progress tracking and focus mode.
- **Study toolkit.** Per-lesson quizzes, flashcards, practice labs and an in-context AI tutor (streamed).
- **Interview prep.** Generated MCQ, theory and coding rounds with a timer, AI grading and a strengths/gaps breakdown.
- **Roadmaps.** Week-by-week plans from a goal, timeframe and current level.
- **Progress & motivation.** Timezone-correct streaks, XP, achievements, a leaderboard (XP is idempotent, so it can't be farmed), analytics and certificates with a public verification page.
- **Community.** Publish, upvote, rate and clone courses; public profiles; shareable read-only course links.
- **Transparency pages.** Live router status (`/status`) and eval results (`/evals`) are public.

<table>
  <tr>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" /></td>
    <td><img src="docs/screenshots/lesson.png" alt="Lesson view" /></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/interview.png" alt="Mock interview session with AI interviewer" /></td>
    <td><img src="docs/screenshots/course.png" alt="Course overview" /></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/router-status.png" alt="AI router status" /></td>
  </tr>
</table>

## Architecture

```mermaid
graph LR
    subgraph Client
      SPA[React 19 SPA<br/>TanStack Query · Tailwind]
    end
    subgraph API[Express API]
      Auth[JWT + refresh rotation]
      Gen[Generation controllers<br/>SSE + heartbeat]
      Router[AI Router<br/>retry · breaker · telemetry]
      RAG[RAG grounding]
    end
    SPA -- REST + SSE --> Auth --> Gen
    Gen --> RAG
    Gen --> Router
    Router -->|1| Gemini
    Router -->|2| Groq
    Router -->|3| OpenRouter
    Gen --> DB[(MongoDB)]
```

Frontend and backend deploy independently (Vercel + Render). Deeper dives: [system](./docs/architecture/system.md), [AI layer](./docs/architecture/ai.md), [auth](./docs/architecture/auth.md), [data model](./docs/database/er-diagram.md), [course generation sequence](./docs/flows/sequence-course-generation.md), and the [engineering decisions](./docs/engineering_decisions.md) (custom router vs. LangChain, SSE vs. WebSockets, token model).

## Tech stack

**Frontend** React 19, TypeScript (strict), Vite, Tailwind CSS, Radix UI, TanStack Query, Framer Motion · **Backend** Node 24 (22+), Express, MongoDB/Mongoose, Zod · **AI** Gemini, Groq, OpenRouter behind a custom router · **Quality** Jest + Supertest, Vitest + Testing Library, Playwright, ESLint, GitHub Actions, CodeQL, Dependabot

## Run it locally in two commands

No database, no API keys, no `.env` needed:

```bash
# terminal 1: API on an in-memory MongoDB, seeded with sample courses, guest mode on
cd backend && npm install && npm run dev:memory

# terminal 2: web app on http://localhost:5173
cd frontend && npm install && npm run dev
```

With no provider key, the AI router runs in a deterministic mock mode so every flow works offline. For real generation, copy `backend/.env.example` to `backend/.env` and add any of `GEMINI_API_KEY`, `GROQ_API_KEY` or `OPENROUTER_API_KEY`. Use `npm run dev` with a real `MONGO_URI` for persistent data, and `npm run seed` once to load the showcase courses guests are cloned from.

The web app calls the API on its own origin under `/api`; Vite proxies that to `http://localhost:8000` (override with `API_PROXY_TARGET`). API docs (Swagger) are served at `http://localhost:8000/api-docs` in development.

## Testing

| Suite | Command | What it covers |
|---|---|---|
| API unit | `npm run test:unit` (backend) | Router failover, circuit breaker, JSON repair, streaks, XP rules, SSE heartbeat. No DB, ~2 s. |
| API integration | `npm run test:integration` | Supertest against in-memory MongoDB: auth, refresh rotation and reuse detection, authorization status codes, ObjectId validation, XP integrity, certificates, guest accounts, community. |
| Coverage | `npm run test:coverage` (backend) | Both suites with a coverage floor that fails the build if coverage drops. |
| UI | `npm test` (frontend) | Components, token refresh/retry, theme, pending-prompt handoff. |
| End-to-end | `npm run e2e` (frontend) | Playwright against the real API behind the same `/api` proxy and security headers as production: landing, auth and return-to-page, session refresh, guest journey through a lesson with no CSP violations, interview session, phone layouts of public and signed-in pages. |
| Evals | `npm run eval` (backend) | Output contract in mock mode (CI); coverage and faithfulness scores with a provider key. |

Every gate (lint, types, all test suites with the coverage floor, dependency audit, evals, build, E2E) runs in CI on each push and pull request.

## Security

Helmet on the API and a Content-Security-Policy plus related headers on the SPA (`frontend/vercel.json`), NoSQL-operator sanitisation, Bearer-only authentication (no cookie-authenticated requests, so no CSRF surface), rate limits per route, per account and per IP, bcrypt, a required strong `JWT_SECRET` and `MONGO_URI` in production, ObjectId validation on every `:id` param (`router.param`), ownership checks on every resource with correct 403/404 responses, and verified-email-only linking for Google and Auth0 (Google sign-in is off unless a valid client ID is configured). Certificate tests report pass/fail only and are attempt-limited. Findings and fixes are written up in [`docs/AUDIT-2026-09.md`](./docs/AUDIT-2026-09.md). Report vulnerabilities per [`SECURITY.md`](./SECURITY.md).

## Deployment

- **API (Render):** root `backend`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET` (32+ chars), at least one AI key, `CLIENT_URL`, `TRUST_PROXY_HOPS=2` (the API sits behind Vercel's rewrite and Render's proxy), and optionally `DEMO_MODE=true`. See [`render.yaml`](./render.yaml).
- **Web (Vercel):** root `frontend`, Vite preset, **no** `VITE_API_BASE_URL`. `vercel.json` rewrites `/api/*` to the Render API so the SPA and API share an origin (required for the refresh cookie), falls back to `index.html` for SPA routes, and sets the security headers.

Full guide: [`docs/deployment.md`](./docs/deployment.md).

## Known limitations

- The RAG corpus is a small demonstrator set; production would expand it and move to Atlas Vector Search.
- The committed eval results are from mock mode, so they check the output contract, not content quality; run `npm run eval` with a key to record real numbers.
- Password reset needs an email provider and isn't implemented; accounts can use Google or Auth0 instead.

## License

MIT © Rahul Paul. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CHANGELOG.md`](./CHANGELOG.md).
