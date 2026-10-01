# Database Schema

MongoDB through Mongoose. Ten collections, one per model in `backend/models/`.
This page is derived from those files; if they change, update it from them.

```mermaid
erDiagram
    USER ||--o{ COURSE : creates
    USER ||--o{ CERTIFICATE : earns
    USER ||--o{ INTERVIEW_PREP : takes
    USER ||--o{ ROADMAP : plans
    USER ||--o{ REFRESH_TOKEN : holds
    USER ||--o{ AUDIT_LOG : performs
    COURSE ||--|{ MODULE : contains
    MODULE ||--|{ LESSON : contains
    COURSE ||--o{ CERTIFICATE : "issued for"
    COURSE |o--o{ INTERVIEW_PREP : "optionally based on"

    USER {
        ObjectId _id
        string name
        string email
        string password "bcrypt, select false"
        string role "user or admin"
        boolean isDemo "guest accounts"
        int xp
        int studyStreak
        int longestStreak
        string timezone "IANA, for streak days"
        array achievements
    }
    COURSE {
        ObjectId _id
        ObjectId creator
        string title
        string difficulty
        boolean isPublic
        string shareId
        int upvotesCount
        int clonesCount
        array ratings
        number averageRating
        object finalTest
    }
    MODULE {
        ObjectId _id
        ObjectId course
        string title
        array lessons
    }
    LESSON {
        ObjectId _id
        ObjectId module
        string title
        string generationStatus
        array outline
        array content
        int quizBestScore
        date completedAt
    }
    CERTIFICATE {
        ObjectId _id
        string certificateId
        ObjectId user
        ObjectId course
        number averageScore
        boolean passed
        date issuedAt
    }
    INTERVIEW_PREP {
        ObjectId _id
        ObjectId user
        ObjectId course
        string topic
        array mcqs
        array theoryQuestions
        array codingQuestions
        string status
        number overallScore
    }
    ROADMAP {
        ObjectId _id
        ObjectId user
        string goal
        string skillLevel
        array weeks
    }
    REFRESH_TOKEN {
        ObjectId _id
        ObjectId user
        string tokenHash "unique"
        string family "reuse detection"
        date expiresAt "TTL"
        boolean revoked
        string replacedByHash
    }
    AUDIT_LOG {
        ObjectId _id
        ObjectId userId
        string action
        string resourceType
        string resourceId
        int xpEarned
    }
    AI_TELEMETRY {
        ObjectId _id
        string provider
        string model
        string endpoint
        string status
        number latencyMs
        int attempt
        date timestamp "TTL 30 days"
    }
```

`AI_TELEMETRY` has no foreign keys; it records one row per model call made by
the AI router.

## Indexes

| Collection | Index | Purpose |
|---|---|---|
| Course | `{ shareId: 1 }` unique, sparse | a share link resolves to exactly one course |
| Course | `{ isPublic: 1, upvotesCount: -1 }` | marketplace listing, most-upvoted first |
| Course | `{ creator: 1, createdAt: -1 }` | a user's own courses, newest first |
| Module, Lesson | `course`, `module` | walk a course top-down |
| User | `{ auth0Id: 1 }`, `{ googleId: 1 }` unique, sparse | external sign-in lookup |
| User | `isDemo` | find guest accounts |
| Certificate | `user`, `course` | a user's certificates, a course's certificates |
| RefreshToken | `tokenHash` unique; `user`; `family` | rotation and family-wide revocation |
| RefreshToken | `{ expiresAt: 1 }`, TTL 0 | expired tokens delete themselves |
| InterviewPrep | `{ user: 1, createdAt: -1 }`, `{ user: 1, status: 1 }` | history and pending sessions |
| Roadmap | `user` | a user's roadmaps |
| AuditLog | `{ userId: 1, action: 1, resourceId: 1 }` | lookups by user, action and resource |
| AiTelemetry | `{ provider: 1, model: 1 }`, `status`, `timestamp` | router health aggregates |
| AiTelemetry | `{ timestamp: 1 }`, TTL 30 days | telemetry ages out |
