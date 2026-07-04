import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { Roadmap } from '../types';

export const roadmapService = {
  getMyRoadmaps: () => handleApi<Roadmap[]>(api.get('/roadmaps/mine'), { showErrorToast: true, fallbackMsg: 'Failed to load roadmaps' }),

  getRoadmap: (id: string) => handleApi<Roadmap>(api.get(`/roadmaps/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load roadmap' }),

  generateRoadmap: (data: { goal: string; duration: string; skillLevel: string }) =>
    handleApi<Roadmap>(api.post('/roadmaps/generate', data), { showErrorToast: true, fallbackMsg: 'Failed to generate roadmap' }),

  deleteRoadmap: (id: string) => handleApi<void>(api.delete(`/roadmaps/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete roadmap' }),

  toggleWeekCompletion: (id: string, weekNumber: number) =>
    handleApi<Roadmap>(api.patch(`/roadmaps/${id}/progress`, { weekNumber }), { showErrorToast: true, fallbackMsg: 'Failed to update progress' }),
};
