/**
 * Shared domain types, mirrored from the backend Mongoose schemas
 * (backend/models/*.js). Centralizing these removes the need for
 * `any` throughout components/services and gives real autocomplete +
 * compile-time safety when the API shape changes.
 */

export type ID = string;

export interface Achievement {
  badge?: string;
  name?: string;
  description?: string;
  unlockedAt?: string;
}

export interface User {
  _id: ID;
  name: string;
  email: string;
  auth0Id?: string;
  googleId?: string;
  role: 'user' | 'admin';
  bio?: string;
  avatar?: string;
  isProfilePublic?: boolean;
  learningInterests?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  theme?: 'dark' | 'light' | 'system';
  onboardingCompleted?: boolean;
  bookmarkedLessons?: ID[];
  certificates?: ID[];
  studyStreak?: number;
  lastActiveDate?: string;
  activityHistory?: string[];
  totalStudyMinutes?: number;
  xp?: number;
  achievements?: Achievement[];
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinalTestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CourseRating {
  user: ID;
  rating: number;
}

export interface Course {
  _id: ID;
  title: string;
  description?: string;
  isFeatured?: boolean;
  bannerUrl?: string;
  bannerStatus?: 'pending' | 'ready' | 'failed';
  clonesCount?: number;
  upvotesCount?: number;
  creator: ID | Pick<User, '_id' | 'name' | 'avatar'>;
  language?: string;
  modules: Module[] | ID[];
  isPublic?: boolean;
  earnedCertificateId?: string;
  shareId?: string;
  finalTest?: {
    generatedAt?: string;
    questions: FinalTestQuestion[];
  };
  ratings?: CourseRating[];
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: ID;
  title: string;
  course: ID;
  lessons: Lesson[] | ID[];
  createdAt?: string;
  updatedAt?: string;
}

/** A Module with its lessons fully populated (as returned by the course
 * detail endpoint, which always populates modules -> lessons). */
export interface PopulatedModule extends Omit<Module, "lessons"> {
  lessons: Lesson[];
}

/** A Course with its modules (and their lessons) fully populated. */
export interface PopulatedCourse extends Omit<Course, "modules"> {
  modules: PopulatedModule[];
}

export interface LessonVideo {
  title?: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
  channel?: string;
}

export interface PracticeLab {
  title?: string;
  brief?: string;
  steps?: string[];
  successCriteria?: string[];
  hint?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface AiConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

/** Lesson body blocks are intentionally loose (Mongoose Mixed type on the
 * backend). Each block at minimum carries a `type` discriminator. */
export interface LessonContentBlock {
  type: string;
  [key: string]: unknown;
}

export interface Lesson {
  _id: ID;
  title: string;
  content: LessonContentBlock[];
  language?: string;
  isEnriched?: boolean;
  generationStatus?: 'none' | 'intro' | 'outline' | 'chunks' | 'content' | 'quiz' | 'complete';
  outline?: string[];
  currentChunkIndex?: number;
  notes?: string;
  bookmarked?: boolean;
  completedAt?: string | null;
  lastOpenedAt?: string | null;
  quizBestScore?: number;
  quizAttempts?: number;
  module: ID;
  videos?: LessonVideo[];
  practiceLab?: PracticeLab | null;
  flashcards?: Flashcard[];
  aiConversation?: AiConversationMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  userAnswer?: number;
}

export interface TheoryQuestion {
  question: string;
  idealAnswer?: string;
  userAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface CodingQuestion {
  title: string;
  problemStatement: string;
  constraints?: string;
  starterCode?: string;
  solutionHint?: string;
  userSolution?: string;
  feedback?: string;
  passed?: boolean;
  score?: number;
}

export interface InterviewChatMessage {
  role: 'interviewer' | 'candidate';
  content: string;
}

export interface InterviewPrep {
  _id: ID;
  user: ID;
  course?: ID | null;
  topic: string;
  mcqs: MCQQuestion[];
  theoryQuestions: TheoryQuestion[];
  codingQuestions: CodingQuestion[];
  mockChat: InterviewChatMessage[];
  status: 'pending' | 'completed';
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendedTopics?: string[];
  readiness?: string;
  summary?: string;
  communicationFeedback?: string;
  technicalFeedback?: string;
  problemSolvingFeedback?: string;
  nextSteps?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  topics?: string[];
  milestones?: string[];
  project?: {
    title?: string;
    description?: string;
  };
}

export interface Roadmap {
  _id: ID;
  user: ID;
  goal: string;
  duration: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  summary?: string;
  weeks: RoadmapWeek[];
  completedWeeks?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  _id: ID;
  certificateId: string;
  user: ID;
  userName: string;
  course: ID;
  courseTitle: string;
  averageScore: number;
  passed: boolean;
  answers: number[];
  issuedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Course completion / lesson-progress tracking used across dashboard
 * and course pages. Shape is derived from usage, not a single schema. */
export interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percent: number;
}

export interface ActivityLogEntry {
  _id: ID;
  userId?: {
    _id: ID;
    name?: string;
    avatar?: string;
  } | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  xpEarned?: number;
  createdAt: string;
}
