# User Flow Diagram

This document traces the complete user journey through the application, mapping the core user behaviors and pathways.

## End-to-End User Flow

```mermaid
graph TD
    %% User entry and auth
    Start([User Visits App]) --> AuthDecision{Has Account?}
    AuthDecision -->|No| Register[User Sign Up / Auth0 OAuth]
    AuthDecision -->|Yes| Login[User Log In]
    
    Register --> Dashboard[User Dashboard]
    Login --> Dashboard

    %% Course Generation
    Dashboard --> CreateCourse[Click Create Course]
    CreateCourse --> InputTopic[Input Topic, Language & Settings]
    InputTopic --> SubmitCourse[Trigger Course Generation]
    SubmitCourse --> ViewCourse[View Course Outline & Syllabus]

    %% Lesson Study
    ViewCourse --> OpenLesson[Open First Lesson]
    OpenLesson --> StreamLesson[Stream Content in Real-time]
    
    %% Interactive Widgets
    StreamLesson --> Interact{Need Help?}
    Interact -->|Hinglish Translate| ExplTool[Request Hinglish Translation / Audio]
    Interact -->|AI Tutor| Tutor[Chat with context-aware AI Sidebar]
    Interact -->|Flashcards| Cards[Review Flashcards]
    Interact -->|Practice Lab| Lab[Run Interactive Coding Lab]
    Interact -->|Take Quiz| Quiz[Complete Lesson End-Quiz]
    
    ExplTool --> ResumeStudy[Continue Lesson Study]
    Tutor --> ResumeStudy
    Cards --> ResumeStudy
    Lab --> ResumeStudy
    Quiz -->|Check Progress| CheckProgress{All Lessons Complete?}
    
    ResumeStudy --> CheckProgress
    
    %% Certification Flow
    CheckProgress -->|No| OpenLesson
    CheckProgress -->|Yes| UnlockExam[Unlock Course Final Exam]
    
    UnlockExam --> TakeExam[Generate and Take Final Test]
    TakeExam --> SubmitExam[Submit Answers]
    SubmitExam --> GradeExam{Pass Grade >= 80%?}
    
    GradeExam -->|No| FailScreen[Fail Screen & Study Recommendations]
    GradeExam -->|Yes| EarnCert[Issue UUID Public Certificate]
    
    FailScreen --> TakeExam
    EarnCert --> ViewCert[View Certificate & Share Public Verification URL]
    ViewCert --> End([Success])
```

## Detailed Path Milestones

1. **Authentication:** Support for OAuth-based integrations using Auth0 alongside traditional credentials.
2. **Dynamic Generation & Streaming:** Course creation uses chunked generation pipelines to prevent API timeout issues, meaning outlines load instantly, and lesson contents stream dynamically.
3. **Interactive Support Systems:** Lessons feature inline tools (AI chatbot, audio and text translations, practice environments, and flashcard widgets).
4. **Final Assessment & Verification:** Once lesson checkpoints are cleared, users submit answers to a final exam. If they achieve 80%+, a secure UUID public certificate is created and linked to their profile.
