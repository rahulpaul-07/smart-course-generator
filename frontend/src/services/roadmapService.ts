import api from '../utils/api';
import { handleApi } from './apiHelper';

export const roadmapService = {
  getMyRoadmaps: () => handleApi(api.get('/roadmaps/mine'), { showErrorToast: true, fallbackMsg: 'Failed to load roadmaps' }),
  
  getRoadmap: (id: string) => handleApi(api.get(`/roadmaps/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load roadmap' }),
  
  generateRoadmap: (data: { goal: string; duration: string; skillLevel: string }) => 
    handleApi(api.post('/roadmaps/generate', data), { showErrorToast: true, fallbackMsg: 'Failed to generate roadmap' }),
  
  deleteRoadmap: (id: string) => handleApi(api.delete(`/roadmaps/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete roadmap' }),
};
