# 10-Minute Deep Dive Walkthrough

**Objective:** A comprehensive, feature-by-feature breakdown of the platform, suitable for a final round technical interview or presentation.

## Part 1: Architecture & Auth (2 mins)
- Explain the decoupled React 18 + Node.js setup.
- Detail the JWT validation strategy and RBAC (Role-Based Access Control) implementation.

## Part 2: The Core Generation Loop (3 mins)
- Generate a course.
- Open Chrome DevTools -> Network tab. Show the `text/event-stream` connection.
- Explain the dynamic fallback strategy (Llama-3 -> Mixtral -> Gemini) handled by `aiRouter.js` to ensure 99.9% uptime.

## Part 3: Adaptive Difficulty & Agents (3 mins)
- Navigate to the AI Agents Hub.
- Run the "Learning Coach" agent.
- Explain how the backend reads `totalStudyMinutes` from the MongoDB User document and injects it into the LLM system prompt context to dynamically alter the reading level of the next generated lesson.

## Part 4: Analytics & Export (1 min)
- Navigate to the Analytics Dashboard.
- Show the GitHub-style heatmap.
- Click the "Export to CSV" button and open the downloaded file.

## Part 5: Community & Deployment (1 min)
- Navigate to the Leaderboard.
- Explain the MongoDB aggregation pipeline used to calculate rankings.
- Briefly show the `docker-compose.yml` and GitHub Actions workflows.
