import api from '../utils/api';
import { handleApi } from './apiHelper';

export const collabService = {
  getActivity: () => handleApi(api.get('/collab/activity'), { showErrorToast: false }),
  getTemplates: () => handleApi(api.get('/collab/templates'), { showErrorToast: false }),
  upvoteTemplate: (courseId: string) => handleApi(api.post(`/collab/templates/${courseId}/upvote`), { showErrorToast: true, fallbackMsg: 'Failed to upvote' }),
  rateTemplate: (courseId: string, rating: number) => handleApi(api.post(`/collab/templates/${courseId}/rate`, { rating }), { showErrorToast: true, fallbackMsg: 'Failed to rate' }),
  cloneTemplate: (courseId: string) => handleApi(api.post(`/collab/templates/${courseId}/clone`), { showErrorToast: true, fallbackMsg: 'Failed to clone' }),
  getLeaderboard: () => handleApi(api.get('/collab/leaderboard'), { showErrorToast: false }),
  getPublicProfile: (userId: string) => handleApi(api.get(`/collab/profile/${userId}`), { showErrorToast: false }),
};
