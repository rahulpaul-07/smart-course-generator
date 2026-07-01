import api from '../utils/api';
import { handleApi } from './apiHelper';

export interface ContinueLearning {
  type: 'Course' | 'Interview Prep' | 'Roadmap';
  title: string;
  id: string;
  updatedAt: string;
  url: string;
}

export interface RecentActivityItem {
  type: string;
  title: string;
  timestamp: string;
  url: string;
}

export interface QuickAction {
  label: string;
  url: string;
  icon: string;
}

export interface DashboardStatistics {
  coursesCreated: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  roadmapsCreated: number;
  practiceLabsGenerated: number;
  flashcardsGenerated: number;
  interviewPacks: number;
  certificatesEarned: number;
  aiQuestionsAsked: number;
}

export interface DashboardProgress {
  overallCompletion: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface DashboardStreak {
  current: number;
  longest: number;
  lastActive: string;
}

export interface DashboardSummary {
  continueLearning: ContinueLearning | null;
  recentActivity: RecentActivityItem[];
  quickActions: QuickAction[];
  statistics: DashboardStatistics;
  progress: DashboardProgress;
  streak: DashboardStreak;
}

export const dashboardService = {
  getSummary: () => handleApi<DashboardSummary>(api.get('/dashboard/summary'), { showErrorToast: true, fallbackMsg: 'Failed to load dashboard summary' }),
};
