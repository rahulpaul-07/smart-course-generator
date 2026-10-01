# Test Coverage

**Product:** CourseAI

What the automated tests in this repository cover, and what they do not. Every job below is
defined in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) and runs on each push and
pull request to `main` that changes code (Markdown-only changes are skipped). A failure in any
job fails the run.

## CI jobs

| Job | What it runs |
|---|---|
| Frontend CI | `npm audit --audit-level=high`, ESLint, the `tsc -b` type check, Vitest + React Testing Library unit and component tests, and the production Vite build |
| Backend CI | ESLint, unit tests with no database (`npm run test:unit`), then unit and integration tests against an in-memory MongoDB with the coverage floor set in `backend/jest.config.js` (`npm run test:coverage`), and `npm audit --audit-level=high` |
| AI Eval Harness | `evals/runEvals.js`. Without a provider key it checks the output contract (mock mode) and fails below 90% structural validity. On pushes to `main`, with a key set as a repository secret, it also fails when LLM-as-judge faithfulness drops below `EVAL_FAIL_UNDER` (default 0.6). Pull requests stay in mock mode, so a provider outage cannot block a review. The scorecard is uploaded as `evals/report.md`. |
| E2E | Playwright against the real stack: the production build served by `vite preview`, calling the Express API on an in-memory MongoDB through the same `/api` proxy as production. No external services or API keys are needed; the AI router runs in its deterministic mock mode. The HTML report is uploaded as an artifact. |
| Load test | autocannon against the liveness and readiness probes (25 connections, 10 s each). Fails on any error, timeout or non-2xx response, or a p99 above 250 ms. |

A separate workflow, [`codeql.yml`](../../.github/workflows/codeql.yml), runs CodeQL analysis on
the JavaScript and TypeScript code.

## End-to-end tests

Two Playwright specs in [`frontend/e2e/`](../../frontend/e2e), run in Chromium:

- **`smoke.spec.ts`** (desktop viewport): the landing page explains the product and routes to
  sign-up; a topic typed on the landing page survives the sign-up detour; the router status and
  eval pages are public; unknown routes show the 404 page; wrong credentials keep you on the login
  page with an error; protected routes redirect anonymous visitors to login; signing in returns
  you to the page that asked for it; sign-up creates an account and starts onboarding; a guest
  lands on a dashboard with a ready course and reads a lesson with no Content-Security-Policy
  violations; the session can be refreshed from the browser; and the interview session is usable
  at laptop width with submit reachable from every section.
- **`responsive.spec.ts`** (Pixel 7 viewport): no horizontal scroll on `/`, `/login`, `/signup`,
  `/status` or the signed-in pages, and the mobile menu opens and links to its sections.

Run them locally with `npm run e2e` in `frontend/`. The Playwright config starts the API
(`npm run dev:memory`) and the preview server itself.

## What is not covered

- **Real model output.** The E2E suite runs the AI router in its mock mode, and the backend tests
  replace the providers with Jest mocks, so neither calls a live model. Generation quality is
  measured only by the eval harness, which calls a live model on pushes to `main` when a key is
  configured (see [`evals/report.md`](../../evals/report.md)).
- **Completing a course and earning a certificate in a browser.** Certificates are covered by the
  backend integration tests, not by a Playwright test.
- **Browsers other than Chromium.**
- **Load on anything but the health probes.** The load test does not exercise course generation.

## Screenshots

Screenshots of the landing, dashboard, course, lesson, interview and router-status pages are in
[`docs/screenshots/`](../screenshots).
