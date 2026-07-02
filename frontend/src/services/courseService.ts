import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { Course, PopulatedCourse } from '../types';

export const courseService = {
  getMyCourses: () => handleApi<Course[]>(api.get('/courses/mine'), { showErrorToast: true, fallbackMsg: 'Failed to load courses' }),

  getCourse: (id: string) => handleApi<PopulatedCourse>(api.get(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load course' }),

  generateCourse: (data: { prompt: string }) => handleApi<Course>(api.post('/courses/generate', data), { showErrorToast: true, fallbackMsg: 'Failed to generate course' }),

  deleteCourse: (id: string) => handleApi<void>(api.delete(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete course' }),

  toggleSharing: (id: string, enabled: boolean) => handleApi<Course>(api.patch(`/courses/${id}/sharing`, { enabled }), { showErrorToast: true, fallbackMsg: 'Could not update sharing' }),

  getSharedCourse: (shareId: string) => handleApi<PopulatedCourse>(api.get(`/public/courses/${shareId}`), { showErrorToast: false }),
};
