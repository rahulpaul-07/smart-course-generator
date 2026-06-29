import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { lessonService } from '../services/lessonService';

export function useLessonNavigation(courseId: string | undefined, lessonId: string | undefined) {
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateCurrentLesson = useCallback((updatedLesson: any) => {
    setLesson(updatedLesson);
    setCourse((currentCourse: any) => {
      if (!currentCourse) return currentCourse;
      return {
        ...currentCourse,
        modules: (currentCourse.modules || []).map((moduleDoc: any) => ({
          ...moduleDoc,
          lessons: (moduleDoc.lessons || []).map((item: any) => (
            item._id === updatedLesson._id ? updatedLesson : item
          )),
        })),
      };
    });
  }, []);

  const fetchLesson = useCallback(async (abortController?: AbortController) => {
    setLoading(true);
    setError(null);
    const controller = abortController || new AbortController();
    
    const [data, err] = await lessonService.getLesson(courseId!, lessonId!, {
      signal: controller.signal
    });
    
    if (data) {
      setCourse((data as any).course);
      setLesson((data as any).lesson);

      lessonService.updateProgress(lessonId!, { opened: true }, { signal: controller.signal })
        .then(([updatedLesson]) => {
          if (updatedLesson) updateCurrentLesson(updatedLesson);
        }).catch(() => {});
    } else if (err && err !== 'CanceledError' && err !== 'AbortError') {
      setError(err);
    }
    
    setLoading(false);
  }, [courseId, lessonId, updateCurrentLesson]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    if (courseId && lessonId) {
      setLoading(true);
      setError(null);
      
      lessonService.getLesson(courseId, lessonId, {
        signal: abortController.signal
      }).then(([data, err]) => {
        if (cancelled) return;
        
        if (data) {
          setCourse((data as any).course);
          setLesson((data as any).lesson);

          lessonService.updateProgress(lessonId, { opened: true }, { signal: abortController.signal })
            .then(([updatedLesson]) => {
              if (!cancelled && updatedLesson) updateCurrentLesson(updatedLesson);
            }).catch(() => {});
        } else if (err && err !== 'CanceledError' && err !== 'AbortError') {
          setError(err);
        }
        
        setLoading(false);
      });
    }

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [courseId, lessonId, updateCurrentLesson]);

  const allLessons = course?.modules?.flatMap((m: any) => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l: any) => l._id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 && currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;

  return {
    course,
    lesson,
    loading,
    error,
    refetch: fetchLesson,
    prevLesson,
    nextLesson,
    updateCurrentLesson,
    setLesson
  };
}
