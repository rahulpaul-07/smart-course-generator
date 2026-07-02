# AI Generation Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AIRouter
    participant Gemini
    participant Groq
    participant OpenRouter
    
    Client->>API: POST /api/courses/generate {prompt}
    API->>AIRouter: createCourseOutline(prompt)
    AIRouter->>Gemini: generateJson(prompt) [gemini-2.5-flash]
    alt Gemini Success
        Gemini-->>AIRouter: JSON Array
    else Gemini Fails/Rate Limited
        AIRouter->>Groq: generateJson(prompt) [llama-3.3-70b-versatile, then llama-3.1-8b-instant]
        alt Groq Success
            Groq-->>AIRouter: JSON Array
        else Groq Fails/Rate Limited
            AIRouter->>OpenRouter: generateJson(prompt) [gpt-4o-mini, then gpt-4o]
            OpenRouter-->>AIRouter: JSON Array
        end
    end
    AIRouter-->>API: Outline Array
    API->>API: Save Course to MongoDB
    API-->>Client: Return Course ID
    
    note over Client,API: Lesson Content Phase
    
    Client->>API: GET /api/lessons/:id/stream
    API->>AIRouter: streamLessonContent(outline)
    loop For Each Section
        AIRouter->>Gemini: createLessonChunk(section)
        Gemini-->>AIRouter: JSON Content Blocks
        AIRouter-->>Client: SSE event: {block}
        AIRouter->>API: Append to Lesson Context
    end
    API->>API: Save Final Content to MongoDB
    API-->>Client: SSE event: {done}
```
