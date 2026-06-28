import api from '../utils/api';
import { handleApi } from './apiHelper';

export const agentService = {
  runReviewer: (courseId: string) => handleApi(api.post('/agents/reviewer', { courseId }), { showErrorToast: true, fallbackMsg: 'Failed to run reviewer agent' }),
  
  runCoach: () => handleApi(api.post('/agents/coach'), { showErrorToast: true, fallbackMsg: 'Failed to run learning coach' }),
  
  runPlanner: (upcomingGoals: string[]) => handleApi(api.post('/agents/planner', { upcomingGoals }), { showErrorToast: true, fallbackMsg: 'Failed to run revision planner' }),
  
  runRecommend: (interests: string[]) => handleApi(api.post('/agents/recommend', { interests }), { showErrorToast: true, fallbackMsg: 'Failed to run recommendations agent' }),
};
