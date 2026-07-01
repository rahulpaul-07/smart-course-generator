import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { Achievement } from '../types';

export interface CourseStat {
  _id: string;
  title: string;
  totalLessons: number;
  completedLessons: number;
  completionPct: number;
  hasCertificate: boolean;
}

export interface TopicScore {
  lesson: string;
  course: string;
  score: number;
}

export interface AnalyticsDashboard {
  studyStreak: number;
  totalStudyMinutes: number;
  totalStudyHours: number;
  activityHistory: string[];
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  overallCompletion: number;
  avgQuizScore: number;
  maxQuizScore: number;
  xp: number;
  achievements: Achievement[];
  weakTopics: TopicScore[];
  strongTopics: TopicScore[];
  courseStats: CourseStat[];
}

export const analyticsService = {
  getDashboard: () => handleApi<AnalyticsDashboard>(api.get('/analytics/dashboard'), { showErrorToast: true, fallbackMsg: 'Failed to load analytics' }),
};
