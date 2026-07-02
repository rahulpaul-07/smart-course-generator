# Test Coverage

**Product:** CourseAI Pro

This document describes the automated test coverage that actually exists in this repository, rather than a manual QA sign-off. No dedicated end-to-end (browser-driven) test suite exists yet — this document previously implied otherwise and has been rewritten.

## Automated CI checks

Every push and pull request to `main` runs the jobs defined in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml):

**Frontend CI** (`frontend/`)
- `npm run lint` — ESLint
- `npm run typecheck` — full `tsc -b` project build
- `npm run test` — Vitest + React Testing Library unit/component tests
- `npm run build` — production Vite build

**Backend CI** (`backend/`)
- `npm run lint` — ESLint
- `npm run test` — Jest + Supertest, run against an in-memory MongoDB instance (`mongodb-memory-server`)

Both jobs must pass before a PR can be merged.

## What's covered vs. not

- Backend: Jest + Supertest tests exercise controllers/routes against a real (in-memory) MongoDB, covering request validation, auth, and core business logic paths.
- Frontend: Vitest + Testing Library tests cover components and hooks in isolation.
- Not covered by automation: full browser-driven end-to-end flows (e.g. signup → generate a course → complete a lesson → earn a certificate). These have been exercised manually during development, but no pass/fail results from a formal manual QA pass are tracked here, and none should be assumed.

## Screenshots / demo

No screenshots or recorded demo currently exist for this project — see the "Screenshots" section in the root [`README.md`](../../README.md).
