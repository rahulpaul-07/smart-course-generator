# Database ER Diagram

This document describes the schema architecture of our database layer, matching the models persisted in MongoDB.

## Entity Relationship Model

```mermaid
erDiagram
    USER {
        ObjectId id PK
        String name
        String email UK
        String password "Nullable for Auth0"
        String auth0Id UK "Nullable for Email/Password"
        ObjectIdArray bookmarkedLessons FK
        ObjectIdArray certificates FK
        Number studyStreak "Consecutive active days"
        String lastActiveDate "YYYY-MM-DD"
        StringArray activityHistory "Active date log"
        Number totalStudyMinutes
        Date createdAt
        Date updatedAt
    }

    COURSE {
        ObjectId id PK
        String title
        String description
        ObjectId creator FK "Ref User"
        String language "Default: English"
        ObjectIdArray modules FK
        Boolean isPublic "Default: false"
        String earnedCertificateId "UUID matching Certificate.certificateId"
        String shareId UK
        Object finalTest "Contains questions, options, correctAnswer, explanation"
        Date createdAt
        Date updatedAt
    }

    MODULE {
        ObjectId id PK
        String title
        ObjectId course FK "Ref Course"
        ObjectIdArray lessons FK
        Date createdAt
        Date updatedAt
    }

    LESSON {
        ObjectId id PK
        String title
        MixedArray content "Blocks of headings, paragraphs, callouts, lists"
        String language "Default: English"
        Boolean isEnriched "Default: false"
        String generationStatus "none|intro|outline|chunks|content|quiz|complete"
        StringArray outline
        Number currentChunkIndex
        String notes
        Boolean bookmarked "Default: false"
        Date completedAt
        Date lastOpenedAt
        Number quizBestScore "0 to 5"
        Number quizAttempts
        ObjectId module FK "Ref Module"
        Date createdAt
        Date updatedAt
    }

    CERTIFICATE {
        ObjectId id PK
        String certificateId UK "UUID"
        ObjectId user FK "Ref User"
        String userName
        ObjectId course FK "Ref Course"
        String courseTitle
        Number averageScore
        Boolean passed
        NumberArray answers
        Date issuedAt
    }

    AITELEMETRY {
        ObjectId id PK
        String provider "gemini|groq|openrouter"
        String model
        String endpoint "generateJson|generateJsonStream"
        String status "success|failure"
        String reason "Error stack / reason if failed"
        Date timestamp
    }

    USER ||--o{ COURSE : "creates"
    USER ||--o{ CERTIFICATE : "earns"
    COURSE ||--|{ MODULE : "contains"
    COURSE ||--o| CERTIFICATE : "associated with"
    MODULE ||--|{ LESSON : "contains"
    USER ||--o{ LESSON : "bookmarks"
    USER ||--o{ ROADMAP : "creates"
    USER ||--o{ INTERVIEWPREP : "attempts"

    ROADMAP {
        ObjectId id PK
        ObjectId user FK "Ref User"
        String goal
        String duration
        String skillLevel "beginner|intermediate|advanced"
        String summary
        Array weeks "weekNumber, title, topics, milestones, project"
        Date createdAt
        Date updatedAt
    }

    INTERVIEWPREP {
        ObjectId id PK
        ObjectId user FK "Ref User"
        ObjectId course FK "Ref Course - optional"
        String topic
        Array mcqs "question, options, correctAnswer, explanation, userAnswer"
        Array theoryQuestions "question, idealAnswer, userAnswer, feedback, score"
        Array codingQuestions "title, problemStatement, starterCode, userSolution"
        Array mockChat "role and content messages"
        String status "pending|completed"
        Number overallScore
        Date createdAt
        Date updatedAt
    }
```

## Schema Definitions & Indexes

### User Collection
* **Auth0 Support:** `auth0Id` is defined as a unique sparse index (`{ auth0Id: 1 }, { unique: true, sparse: true }`) to allow standard email registrations alongside OAuth connections.
* **Relations:** Maintains arrays of ObjectIds pointing to `bookmarkedLessons` and `certificates`.

### Course Collection
* **Structure:** Encapsulates high-level details, an array of `Module` references, and the dynamically generated `finalTest` nested sub-document structure.
* **Indexes:** `creator` is indexed for fast lookup on the "My Courses" page. `shareId` is set as a unique sparse index for clean URL public course sharing.

### Lesson Collection
* **Dynamic Generation:** Tracks state variables like `generationStatus` and `currentChunkIndex` to support modular, token-efficient stream content loading.
* **Structured Blocks:** The `content` field is a Mixed Array holding blocks with schemas defining paragraph texts, warning callouts, code samples, list components, etc.

### AI Telemetry Collection
* **Telemetry Data:** Captures detailed usage logs of LLM provider execution times and errors.
* **Indexes:** Multi-key indexes on `provider` and `model` + descending indices on `timestamp` for dashboard latency plotting.

### Roadmap Collection
* **Structure:** Stores AI-generated weekly learning plans with topics, milestones, and mini-projects.
* **Relations:** Each roadmap belongs to a single user.

### InterviewPrep Collection
* **Structure:** Stores AI-generated interview preparation packages containing MCQs, theory questions, coding challenges, and mock interview chat history.
* **Scoring:** Maintains per-question user answers and AI-evaluated feedback with an overall composite score.
