# Contributing to CourseAI Pro

First off, thank you for considering contributing to CourseAI Pro! It's people like you that make the open-source community such a fantastic place to learn, inspire, and create.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally: `git clone https://github.com/rahulpaul-07/smart-course-generator.git`
3. **Set up the backend**: Install dependencies (`npm i` in `/backend`) and copy `.env.example` to `.env`.
4. **Set up the frontend**: Install dependencies (`npm i` in `/frontend`) and configure Vite environment variables.

## Submitting Pull Requests

- Create a new branch: `git checkout -b feature/your-feature-name`
- Make your changes and test them thoroughly.
- Follow the existing code style (Prettier/ESLint rules are included).
- Write descriptive commit messages.
- Push your branch to GitHub and open a Pull Request against the `main` branch.

## Before you submit a PR

CI runs the following checks on every push and pull request (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) — run them locally first so your PR doesn't fail the build:

```bash
# Frontend
cd frontend
npm run lint
npm run typecheck
npm test

# Backend
cd backend
npm run lint
npm test
```

## Issue Tracking

If you find a bug, please create a detailed GitHub Issue including:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment (OS, Node.js version, browser)
