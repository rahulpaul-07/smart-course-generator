# Pushing this audit

Everything here is a change to files already in the repo, plus two new files
(`backend/services/streakService.js`, `backend/tests/unit/`) and
`docs/AUDIT-2026-09.md`. No dependencies were added or removed, so no lockfile
changes.

## Before you push

Run the integration suite locally — it could not be run in the audit
environment because `mongodb-memory-server` downloads its binary from
`fastdl.mongodb.org`:

```powershell
cd C:\Users\Rahul\OneDrive\Desktop\PROJECTS\smart-course-generator\backend
npm run test:unit          # should be 25 passed, ~2s
npm run test:integration   # downloads mongod on first run
```

Then eyeball the two changes that are visual and cannot be unit-tested:

```powershell
cd ..\frontend
npm run dev
```

1. **Light mode.** Settings → Appearance → Light, then open any lesson. Body
   text, AI chat replies and interview feedback should be dark on light. Before
   this change they were near-white on near-white.
2. **Gutter alignment.** Click through Dashboard → Courses → Analytics →
   Roadmap → Community and watch the left edge of the content. It should not
   move. Same for the max content width on a wide window.
3. **Code blocks.** Open a lesson with a code snippet — tokens should be
   coloured, not monochrome.

## Committing

The changes group cleanly into three commits if you want a readable history:

```powershell
git add frontend/src/components/layout frontend/src/index.css frontend/src/pages/RoadmapPage.tsx frontend/src/pages/SharedCoursePage.tsx
git commit -m "Unify page width and gutters behind a single PageContainer"

git add frontend/src/components/blocks frontend/src/components/chat frontend/src/components/interview frontend/src/components/lesson frontend/src/hooks frontend/src/utils/api.ts
git commit -m "Fix light-mode typography, code-block colouring, and client-side hook defects"

git add backend docs/AUDIT-2026-09.md CHANGELOG.md .github/workflows/ci.yml
git commit -m "Fix AI router fallback, streak and XP logic; split test suites"

git push origin main
```

Or as one:

```powershell
git add -A
git commit -m "Audit fixes: layout, light-mode typography, AI router fallback, streak and XP correctness"
git push origin main
```

## After you push

Check the Actions tab. The backend job now has two test steps instead of one —
`Run Unit Tests (no database)` should finish in seconds, and
`Run Integration Tests (mongodb-memory-server)` after it. If the integration
step goes red, send me the failing suite.

One thing worth doing separately: `docs/AUDIT-2026-09.md` is the strongest
artifact in this repo for an interview. It is the "here is what was broken and
how I found it" document, and it is the reason the choke controller repo reads
the way it does. Consider linking it from the README's Documentation section.
