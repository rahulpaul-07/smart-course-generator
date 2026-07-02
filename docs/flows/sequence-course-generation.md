# Sequence Diagram: Course Outline & Chapter Generation

This document maps out the detailed timeline and sequence of operations for generating structured courses and outlines via the AI Router.

## Generation Timeline Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Student (UI)
    participant Front as React Client
    participant Back as Express Server
    participant Middle as verifyAuth0Token
    participant Controller as CourseController
    participant Service as CourseGenService
    participant Router as AI Router Service
    participant LLM as Active LLM Provider
    participant DB as MongoDB Atlas

    User->>Front: Enter topic (e.g. "JSON Basics") & click "Generate"
    Front->>Back: POST /api/courses/generate { topic, language } (JWT attached)
    Back->>Middle: Validate JWT token signature
    Middle-->>Back: Token valid (Inject user context)
    Back->>Controller: generateCourseContent(req, res)
    Controller->>Service: generateOutlineAndSave(topic, userId, language)
    Service->>Router: generateJson(outlineSystemPrompt, userTopicPrompt)
    
    Note over Router, LLM: AI Router evaluates available providers & fallback chains
    Router->>LLM: API Call (Tier 1: Gemini 2.5 Flash)
    alt Gemini API Success
        LLM-->>Router: Return structural JSON (Outline, Modules)
    else Gemini API Fails (Rate limit / Timeout)
        Router->>Router: Switch to fallback provider
        Router->>LLM: API Call (Tier 2: Groq Llama-3.3-70b, then Llama-3.1-8b, then OpenRouter)
        LLM-->>Router: Return structural JSON (Outline, Modules)
    end

    Router-->>Service: Return validated JSON response
    Service->>DB: Write Course entity with finalTest structure
    Service->>DB: Write Module entities associated with Course
    Service->>DB: Write placeholder Lesson entities with generationStatus="none"
    Service-->>Controller: Return fully populated Course Document
    Controller-->>Front: Respond with Course Metadata (JSON)
    Front-->>User: Render interactive Course Outline & Modules
```

## Detailed Component Roles

1. **Auth Middleware (`verifyAuth0Token`):** Intercepts course requests, parses Bearer tokens, validates signatures against JWKS endpoints, and populates the `req.user` payload.
2. **AI Router Fallback Engine:** Handles rate limits or outages seamlessly. The full chain is Gemini (`gemini-2.5-flash`) → Groq (`llama-3.3-70b-versatile`, then `llama-3.1-8b-instant`) → OpenRouter (`gpt-4o-mini`, then `gpt-4o`). If a tier fails, it automatically shifts to the next and files success/fail logs in telemetry.
3. **Multi-level Entity Creation:** Rather than constructing full course content upfront, the generator first writes the hierarchy structure (`Course` -> `Module` -> `Lesson` stubs). Content streaming is then requested on-demand as the user visits each lesson, protecting backend systems from payload limits.
