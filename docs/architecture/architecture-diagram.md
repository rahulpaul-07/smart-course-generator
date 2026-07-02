# System Architecture Diagram

This document illustrates the high-level architecture of **CourseAI Pro**, highlighting the data flow from the client application through the Express backend, the AI Router, and the persistence layer.

## System Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [React SPA - Client]
        UI[Vite & Tailwind UI]
        Router[React Router Dom]
        Auth0Client[Auth0 SDK Client]
    end

    %% Gateway Layer
    subgraph Gateway [Inbound Routing]
        Auth0Guard[verifyAuth0Token Middleware]
    end

    %% Backend Layer
    subgraph Backend [Express API - Server]
        Server[Express Server]
        CourseController[Course Controller]
        CertController[Certificate Controller]
        ExplanationsController[Explanations Controller]
        
        subgraph Services [Business Logic]
            CourseGen[Course Gen Service]
            LessonGen[Lesson Gen Service]
            AiRouter[AI Router Middleware]
            YoutubeService[YouTube Search API]
        end
    end

    %% AI Providers Layer
    subgraph AIProviders [AI LLM Routing Group]
        Gemini[Gemini API]
        Groq[Groq API]
        OpenRouter[OpenRouter API]
    end

    %% Database Layer
    subgraph Database [Storage & Telemetry]
        Mongo[MongoDB Atlas]
        UserCol[(Users Collection)]
        CourseCol[(Courses Collection)]
        LessonCol[(Lessons Collection)]
        CertCol[(Certificates Collection)]
        TelemCol[(AiTelemetry Collection)]
    end

    %% Interactions
    UI -->|Navigate| Router
    UI -->|Bearer JWT| Auth0Guard
    Auth0Guard -->|Authorized API Request| Server
    
    Server --> CourseController
    Server --> CertController
    Server --> ExplanationsController

    CourseController --> CourseGen
    CourseController --> LessonGen
    
    CourseGen --> AiRouter
    LessonGen --> AiRouter
    ExplanationsController --> AiRouter
    
    AiRouter -->|1. Try Key / Quota| Gemini
    AiRouter -->|2. Fallback| Groq
    AiRouter -->|3. Fallback| OpenRouter
    AiRouter -->|Log API Success/Fail| TelemCol

    CourseGen --> YoutubeService
    
    %% DB Mapping
    CourseController --> Mongo
    CertController --> Mongo
    Mongo === UserCol
    Mongo === CourseCol
    Mongo === LessonCol
    Mongo === CertCol
    Mongo === TelemCol
```

## Architectural Components

1. **React Frontend (SPA):** Built using Vite, React, and Tailwind CSS. Authenticates users via Auth0 SDK and manages client-side routing.
2. **Express API Server:** Serves as the application gateway, performing authentication validation, exposing endpoints, and orchestrating requests.
3. **AI Router Service:** A critical failover service that routes AI requests across Gemini, Groq, and OpenRouter APIs (in that priority order) based on availability and key validation. Saves telemetry to MongoDB.
4. **MongoDB Layer:** Persists course outlines, lesson content, user records, earned certificates, and telemetry data.
