import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { InterviewPrep } from '../types';

export const interviewService = {
  getMyInterviews: () => handleApi<InterviewPrep[]>(api.get('/interviews/mine'), { showErrorToast: false }),

  getInterview: (id: string) => handleApi<InterviewPrep>(api.get(`/interviews/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load interview prep' }),

  generateInterview: (topic: string) => handleApi<InterviewPrep>(api.post('/interviews/generate', { topic }), { showErrorToast: true, fallbackMsg: 'Failed to generate interview pack' }),

  deleteInterview: (id: string) => handleApi<void>(api.delete(`/interviews/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete' }),

  submitAssessment: (sessionId: string, data: Record<string, unknown>) =>
    handleApi<InterviewPrep>(api.post(`/interviews/${sessionId}/submit`, data), { showErrorToast: true, fallbackMsg: 'Failed to submit assessment' }),
};
