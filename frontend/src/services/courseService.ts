import api, { baseURL } from '../utils/api';
import { handleApi, getApiError } from './apiHelper';
import type { Course, PopulatedCourse } from '../types';

export type CourseGenerationStage = 'analyzing_topic' | 'designing_curriculum' | 'saving_course' | 'ready';

export const courseService = {
  getMyCourses: () => handleApi<Course[]>(api.get('/courses/mine'), { showErrorToast: true, fallbackMsg: 'Failed to load courses' }),

  getCourse: (id: string) => handleApi<PopulatedCourse>(api.get(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to load course' }),

  generateCourse: (data: { prompt: string }) => handleApi<Course>(api.post('/courses/generate', data), { showErrorToast: true, fallbackMsg: 'Failed to generate course' }),

  /**
   * Streams course generation over SSE, mirroring the fetch + manual
   * SSE-parsing pattern used by useLessonProgress.ts for enrich-stream.
   * Reports honest, real backend milestones via onStage as they happen
   * (analyzing_topic -> designing_curriculum -> saving_course -> ready).
   */
  generateCourseStream: async (
    data: { prompt: string; language?: string },
    onStage?: (stage: CourseGenerationStage) => void
  ): Promise<[Course | null, string | null]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/courses/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMsg = errorData.error || 'Failed to start generation';
        if (typeof errMsg === 'object') errMsg = errMsg.message || JSON.stringify(errMsg);
        throw new Error(errMsg);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';
      let course: Course | null = null;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (currentEvent === 'stage') {
                onStage?.(parsed.stage);
              } else if (currentEvent === 'done') {
                course = parsed;
              } else if (currentEvent === 'error') {
                let errMsg = parsed.error || 'Generation failed';
                if (typeof errMsg === 'object') errMsg = errMsg.message || JSON.stringify(errMsg);
                streamError = errMsg;
              }
            } catch {
              // Ignore malformed/partial SSE data chunks.
            }
            currentEvent = '';
          }
        }
      }

      if (streamError) throw new Error(streamError);
      if (!course) throw new Error('Generation ended unexpectedly. Please try again.');
      return [course, null];
    } catch (error) {
      return [null, getApiError(error) || 'Failed to generate course'];
    }
  },

  deleteCourse: (id: string) => handleApi<void>(api.delete(`/courses/${id}`), { showErrorToast: true, fallbackMsg: 'Failed to delete course' }),

  toggleSharing: (id: string, enabled: boolean) => handleApi<Course>(api.patch(`/courses/${id}/sharing`, { enabled }), { showErrorToast: true, fallbackMsg: 'Could not update sharing' }),

  getSharedCourse: (shareId: string) => handleApi<PopulatedCourse>(api.get(`/public/courses/${shareId}`), { showErrorToast: false }),
};
