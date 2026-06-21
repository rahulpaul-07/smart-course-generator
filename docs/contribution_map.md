# Code Contribution Map

The Unified Course Platform represents a synthesis of multiple specialized modules merged into a cohesive mono-repo structure.

## Original Repository: AI-CourseGenerator (Base)
- `backend/services/courseGeneration.js`: Prompt engineering for the initial module/lesson outline.
- `backend/services/aiRouter.js`: The underlying Multi-LLM fallback logic.
- `frontend/src/pages/HomePage.jsx`: The original course creation input UI.

## Original Repository: AI-Teacher (Interactive)
- `backend/services/lessonGeneration.js`: The SSE streaming logic for real-time lesson rendering.
- `frontend/src/pages/LessonViewerPage.jsx`: The real-time markdown streaming UI.
- `backend/services/youtubeService.js`: Dynamic video fetching based on lesson context.

## Original Repository: Text-to-Learn (Study Tools)
- `backend/services/studyGeneration.js`: Generation of Flashcards, Quizzes, and Practice Labs.
- `frontend/src/pages/InterviewPrepPage.jsx`: The mock interview and coding question UI.
- `backend/routes/certificates.js`: PDF Generation for course completions.

## Custom Additions (Portfolio Excellence Wave)
- `backend/services/agents/`: The entire multi-agent orchestration architecture.
- `backend/controllers/collaborationController.js`: Social, Profile, and Leaderboard mechanics.
- `frontend/src/components/ErrorBoundary.jsx`: React crash protection.
- `docker-compose.yml` & `Dockerfile`: Enterprise deployment configurations.
