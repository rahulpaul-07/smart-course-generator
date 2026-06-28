import api from '../utils/api';
import { handleApi } from './apiHelper';

export const lessonService = {
  getLesson: (courseId: string, lessonId: string, config?: any) => 
    handleApi(api.get(`/courses/${courseId}/lessons/${lessonId}`, config), { showErrorToast: true, fallbackMsg: 'Failed to load lesson content.' }),
    
  updateProgress: (lessonId: string, changes: any, config?: any) => 
    handleApi(api.patch(`/courses/lessons/${lessonId}/progress`, changes, config), { showErrorToast: true, fallbackMsg: 'Failed to update progress' }),
    
  generateFlashcards: (courseId: string, lessonId: string) => 
    handleApi(api.post(`/courses/${courseId}/lessons/${lessonId}/flashcards`), { showErrorToast: true, fallbackMsg: 'Failed to generate flashcards' }),
    
  generateLab: (courseId: string, lessonId: string, force?: boolean) => 
    handleApi(api.post(`/courses/${courseId}/lessons/${lessonId}/lab${force ? '?force=true' : ''}`), { showErrorToast: true, fallbackMsg: 'Failed to generate lab' }),
    
  generateVideos: (courseId: string, lessonId: string) => 
    handleApi(api.post(`/courses/${courseId}/lessons/${lessonId}/add-videos`), { showErrorToast: true, fallbackMsg: 'Could not add videos' }),
    
  generateHinglishText: (lessonText: string) =>
    handleApi(api.post('/explanations/hinglish-text', { lessonText }), { showErrorToast: false }),
    
  generateHinglishAudio: (lessonText: string) =>
    handleApi(api.post('/explanations/hinglish-audio', { lessonText, voiceName: 'Kore', tone: 'friendly teacher' }, { responseType: 'blob' }), { showErrorToast: false }),
    
  executeCode: (endpoint: string) => 
    handleApi(api.post(endpoint), { showErrorToast: true, fallbackMsg: 'Execution failed' }),
    
    
  getExplanation: (endpoint: string, data: any) => 
    handleApi(api.post(endpoint, data), { showErrorToast: true, fallbackMsg: 'Failed to load explanation' }),
};
