import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { baseURL } from '../utils/api';
import { lessonService } from '../services/lessonService';
import type { Lesson } from '../types';
import type { Dispatch, SetStateAction } from 'react';
import { getApiError } from '../services/apiHelper';

const API_BASE = baseURL;

export function useLessonProgress(courseId: string | undefined, lessonId: string | undefined, updateCurrentLesson: (lesson: Lesson) => void, setLesson: Dispatch<SetStateAction<Lesson | null>>) {
  const [generating, setGenerating] = useState(false);
  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'interrupted' | 'error' | 'success'>('idle');
  const [streamError, setStreamError] = useState('');
  const [streamStage, setStreamStage] = useState('Creating outline');
  const [selectedDepth, setSelectedDepth] = useState('standard');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [addingVideos, setAddingVideos] = useState(false);
  const [streamedCount, setStreamedCount] = useState(0);

  const isGeneratingRef = useRef(false);

  async function generateLesson() {
    if (isGeneratingRef.current) return;
    const jobKey = `lesson_gen_${courseId}_${lessonId}`;
    const activeStr = sessionStorage.getItem('active_generation_job');
    if (activeStr) {
      try {
        const activeJob = JSON.parse(activeStr);
        if (activeJob.key === jobKey && Date.now() - activeJob.timestamp < 120000) {
          toast.success('Generation is continuing in the background. Please wait...');
          return;
        }
      } catch {
        // Malformed sessionStorage entry; fall through and start a fresh job.
      }
    }

    isGeneratingRef.current = true;
    sessionStorage.setItem('active_generation_job', JSON.stringify({ key: jobKey, timestamp: Date.now() }));
    setGenerating(true);
    setShowDepthPicker(false);
    setStreamedCount(0);
    setStreamStage('Creating outline');
    setStreamStatus('idle');
    setLesson((prev) => prev ? { ...prev, content: [] } : prev);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/enrich-stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ depth: selectedDepth, language: selectedLanguage }),
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
      let count = 0;
      let streamComplete = false;
      let streamFinished = false;
      let streamInterrupted = false;
      let currentEvent = '';

      while (!streamComplete) {
        let done, value;
        try {
          const result = await reader.read();
          done = result.done;
          value = result.value;
        } catch {
          done = true;
          streamInterrupted = true;
        }

        if (done) {
          streamComplete = true;
          continue;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (currentEvent === 'block') {
                count++;
                setStreamedCount(count);
                if (count === 1) setStreamStage('Writing section');
                else if (count === 3) setStreamStage('Generating code examples');
                else if (count === 6) setStreamStage('Finalizing lesson');
                setLesson((prev) => prev ? { ...prev, content: [...(prev.content || []), data] } : prev);
              } else if (currentEvent === 'videos') {
                setLesson((prev) => prev ? { ...prev, videos: data } : prev);
              } else if (currentEvent === 'done') {
                setStreamStage('Saving lesson');
                updateCurrentLesson(data);
                streamFinished = true;
              } else if (currentEvent === 'error') {
                let errMsg = data.error || 'Generation failed';
                if (typeof errMsg === 'object') errMsg = errMsg.message || JSON.stringify(errMsg);
                throw new Error(errMsg);
              }
            } catch (parseErr) {
              const msg = parseErr instanceof Error ? parseErr.message : '';
              if (msg && !msg.includes('JSON')) throw parseErr;
            }
            currentEvent = '';
          }
        }
      }

      if (!streamFinished) streamInterrupted = true;
      if (streamInterrupted) throw new Error('STREAM_INTERRUPTED');
      if (count > 0) {
        setStreamStatus('success');
        addVideos(); // Auto-embed videos for seamless UX
      } else {
        toast.error('No content was generated. Please try again.');
        setStreamStatus('error');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'STREAM_INTERRUPTED') {
        setStreamStatus('interrupted');
        return;
      }
      setStreamStatus('error');
      setStreamError(getApiError(error) || 'Failed to generate content');
    } finally {
      sessionStorage.removeItem('active_generation_job');
      isGeneratingRef.current = false;
      setGenerating(false);
      setStreamedCount(0);
    }
  }

  async function addVideos() {
    setAddingVideos(true);
    const [data] = await lessonService.generateVideos(courseId!, lessonId!);
    if (data) {
      updateCurrentLesson(data.lesson);
      toast.success(`${data.videos.length} videos added`);
    }
    setAddingVideos(false);
  }

  return {
    generating,
    showDepthPicker,
    setShowDepthPicker,
    streamStatus,
    streamError,
    streamStage,
    selectedDepth,
    setSelectedDepth,
    selectedLanguage,
    setSelectedLanguage,
    addingVideos,
    streamedCount,
    generateLesson,
    addVideos
  };
}
