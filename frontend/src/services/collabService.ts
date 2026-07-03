import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { ActivityLogEntry, User } from '../types';

export interface CommunityTemplate {
  _id: string;
  title: string;
  description?: string;
  isFeatured?: boolean;
  clonesCount: number;
  upvotesCount: number;
  averageRating: number;
  hasUpvoted?: boolean;
  createdAt: string;
  language?: string;
  creator?: {
    _id: string;
    name?: string;
    avatar?: string;
  };
}

export interface LeaderboardUser {
  _id: string;
  name: string;
  avatar?: string;
  studyStreak: number;
  totalStudyMinutes: number;
  xp: number;
  achievements?: User['achievements'];
}

export interface PublicProfileCourse {
  _id: string;
  title: string;
  description?: string;
  upvotesCount: number;
  clonesCount: number;
  averageRating: number;
}

export interface PublicProfileResponse {
  user: Pick<User, '_id' | 'name' | 'avatar' | 'bio' | 'studyStreak' | 'totalStudyMinutes' | 'xp' | 'achievements' | 'isProfilePublic'>;
  courses: PublicProfileCourse[];
}

export const collabService = {
  getActivity: () => handleApi<ActivityLogEntry[]>(api.get('/collab/activity'), { showErrorToast: false }),
  getTemplates: () => handleApi<CommunityTemplate[]>(api.get('/collab/templates'), { showErrorToast: false }),
  getMyUpvotedTemplateIds: () => handleApi<string[]>(api.get('/collab/templates/my-upvotes'), { showErrorToast: false }),
  upvoteTemplate: (courseId: string) => handleApi<{ success: boolean; upvotesCount: number; hasUpvoted: boolean }>(api.post(`/collab/templates/${courseId}/upvote`), { showErrorToast: true, fallbackMsg: 'Failed to upvote' }),
  rateTemplate: (courseId: string, rating: number) => handleApi<{ success: boolean; averageRating: number }>(api.post(`/collab/templates/${courseId}/rate`, { rating }), { showErrorToast: true, fallbackMsg: 'Failed to rate' }),
  cloneTemplate: (courseId: string) => handleApi<{ success: boolean; courseId: string }>(api.post(`/collab/templates/${courseId}/clone`), { showErrorToast: true, fallbackMsg: 'Failed to clone' }),
  getLeaderboard: () => handleApi<LeaderboardUser[]>(api.get('/collab/leaderboard'), { showErrorToast: false }),
  getPublicProfile: (userId: string) => handleApi<PublicProfileResponse>(api.get(`/collab/profile/${userId}`), { showErrorToast: false }),
};
