import api from '../utils/api';
import { handleApi } from './apiHelper';

export const courseService = {
  getMyCourses: () => handleApi(api.get('/courses/mine'), { showErrorToast: true, fallbackMsg: 'Failed to load courses' }),
  
  getCourse: (id: string) => handleApi(api.get(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load course' }),
  
  generateCourse: (data: { prompt: string }) => handleApi(api.post('/courses/generate', data), { showErrorToast: true, fallbackMsg: 'Failed to generate course' }),
  
  deleteCourse: (id: string) => handleApi(api.delete(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete course' }),
  
  updateProgress: (id: string, moduleId: string, lessonId: string) => handleApi(api.post(`/courses/${id}/progress`, { moduleId, lessonId }), { showErrorToast: false }),
  
  generateLesson: (id: string, moduleId: string, lessonId: string) => handleApi(api.post(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}/generate`), { showErrorToast: true, fallbackMsg: 'Failed to generate lesson' }),
  
  toggleSharing: (id: string, enabled: boolean) => handleApi(api.patch(`/courses/${id}/sharing`, { enabled }), { showErrorToast: true, fallbackMsg: 'Could not update sharing' }),
  
  getSharedCourse: (shareId: string) => handleApi(api.get(`/public/courses/${shareId}`), { showErrorToast: false }),
};
