# Recruiter Walkthrough

Welcome to the **Unified Course Platform**. This document is a guided tour for hiring managers and technical recruiters evaluating the scope, complexity, and product vision of this project.

## The Elevator Pitch
This project is an Enterprise-ready, Multi-Agent AI Learning Platform. It transitions traditional passive learning into an interactive, dynamically generated curriculum tailored specifically to a user's weaknesses and goals.

## Core Differentiators
1. **Multi-Agent Architecture**: We don't just use one LLM prompt. We orchestrate specialized agents (Course Reviewer, Learning Coach, Revision Planner) in parallel.
2. **Adaptive Difficulty Engine**: The system actively monitors a user's quiz scores and time spent, automatically rewriting lesson materials in real-time to simplify concepts or increase technical depth based on the learner's profile.
3. **Enterprise Resilience**: Built with full Request Tracing (UUIDs), Rate Limiting (DDoS prevention), and RBAC (Role-Based Access Control).

## Recommended Flow
1. **Sign Up**: Experience the seamless Auth0 PKCE flow.
2. **Dashboard**: Note the responsive glassmorphism UI.
3. **Generate a Course**: Type "Advanced Backend Architecture". Watch the LLM stream the curriculum in real-time.
4. **Learning Analytics**: Check the CSV export and interactive Github-style activity heatmaps.
5. **AI Agent Hub**: Navigate to the Multi-Agent page and interact with the customized Persona pipelines.

## Tech Stack Mastery Demonstrated
- **Frontend**: React 18, Vite, Tailwind CSS, Context API.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **AI/ML**: Direct orchestration of Llama-3, Gemini-2.5, and Mixtral via Groq & OpenRouter arrays.
- **DevOps**: Docker, Nginx, GitHub Actions CI/CD.
