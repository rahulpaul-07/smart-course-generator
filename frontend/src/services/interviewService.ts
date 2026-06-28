import api from '../utils/api';
import { handleApi } from './apiHelper';

export const interviewService = {
  getMyInterviews: () => handleApi(api.get('/interviews/mine'), { showErrorToast: false }),
  
  getInterview: (id: string) => handleApi(api.get(`/interviews/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load interview prep' }),
  
  generateInterview: (topic: string) => handleApi(api.post('/interviews/generate', { topic }), { showErrorToast: true, fallbackMsg: 'Failed to generate interview pack' }),
  
  deleteInterview: (id: string) => handleApi(api.delete(`/interviews/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete' }),

  submitAssessment: (sessionId: string, data: any) => 
    handleApi(api.post(`/interviews/${sessionId}/submit`, data), { showErrorToast: true, fallbackMsg: 'Failed to submit assessment' }),
  
  completeSession: (sessionId: string) => 
    handleApi(api.post(`/interviews/${sessionId}/complete`), { showErrorToast: true, fallbackMsg: 'Failed to complete interview' }),
  
  getResults: (sessionId: string) => 
    handleApi(api.get(`/interviews/${sessionId}/results`), { showErrorToast: true, fallbackMsg: 'Failed to load results' }),
};
