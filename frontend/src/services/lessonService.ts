import type { AxiosRequestConfig } from 'axios';
import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { Flashcard, Lesson, LessonVideo, PopulatedCourse } from '../types';

export type { Flashcard };

export interface LessonProgressUpdate {
  opened?: boolean;
  completed?: boolean;
  bookmarked?: boolean;
  notes?: string;
  quizBestScore?: number;
  quizAttempts?: number;
}

export const lessonService = {
  // The backend's getLessonView controller returns { course, lesson }, not a
  // bare Lesson -- see backend/controllers/courseController.js.
  getLesson: (courseId: string, lessonId: string, config?: AxiosRequestConfig) =>
    handleApi<{ course: PopulatedCourse; lesson: Lesson }>(api.get(`/courses/${courseId}/lessons/${lessonId}`, config), { showErrorToast: true, fallbackMsg: 'Failed to load lesson content.' }),

  updateProgress: (lessonId: string, changes: LessonProgressUpdate, config?: AxiosRequestConfig) =>
    handleApi<Lesson>(api.patch(`/courses/lessons/${lessonId}/progress`, changes, config), { showErrorToast: true, fallbackMsg: 'Failed to update progress' }),

  generateFlashcards: (courseId: string, lessonId: string, force?: boolean) =>
    handleApi<{ flashcards: Flashcard[] }>(api.post(`/courses/${courseId}/lessons/${lessonId}/flashcards${force ? '?force=true' : ''}`), { showErrorToast: true, fallbackMsg: 'Failed to generate flashcards' }),

  generateLab: (courseId: string, lessonId: string, force?: boolean) =>
    handleApi<Lesson>(api.post(`/courses/${courseId}/lessons/${lessonId}/lab${force ? '?force=true' : ''}`), { showErrorToast: true, fallbackMsg: 'Failed to generate lab' }),

  generateVideos: (courseId: string, lessonId: string) =>
    handleApi<{ lesson: Lesson; videos: LessonVideo[] }>(api.post(`/courses/${courseId}/lessons/${lessonId}/add-videos`), { showErrorToast: true, fallbackMsg: 'Could not add videos' }),

  clearChat: (courseId: string, lessonId: string) =>
    handleApi<{ success: boolean }>(api.delete(`/courses/${courseId}/lessons/${lessonId}/chat`), { showErrorToast: true, fallbackMsg: 'Failed to clear chat history' }),

  generateHinglishText: (lessonText: string) =>
    handleApi<{ data: { hinglishText: string } }>(api.post('/explanations/hinglish-text', { lessonText }), { showErrorToast: false }),

  generateHinglishAudio: (lessonText: string) =>
    handleApi<Blob>(api.post('/explanations/hinglish-audio', { lessonText, voiceName: 'Kore', tone: 'friendly teacher' }, { responseType: 'blob' }), { showErrorToast: false }),

  executeCode: (endpoint: string) =>
    handleApi<unknown>(api.post(endpoint), { showErrorToast: true, fallbackMsg: 'Execution failed' }),

  getExplanation: (endpoint: string, data: Record<string, unknown>) =>
    handleApi<unknown>(api.post(endpoint, data), { showErrorToast: true, fallbackMsg: 'Failed to load explanation' }),
};
