import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { lessonService } from '../services/lessonService';

export function useLessonNavigation(courseId: string | undefined, lessonId: string | undefined) {
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateCurrentLesson = useCallback((updatedLesson: any) => {
    setLesson(updatedLesson);
    setCourse((currentCourse: any) => {
      if (!currentCourse) return currentCourse;
      return {
        ...currentCourse,
        modules: currentCourse.modules.map((moduleDoc: any) => ({
          ...moduleDoc,
          lessons: moduleDoc.lessons.map((item: any) => (
            item._id === updatedLesson._id ? updatedLesson : item
          )),
        })),
      };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function loadLesson() {
      setLoading(true);
      const [data, error] = await lessonService.getLesson(courseId!, lessonId!, {
        signal: abortController.signal
      });
      
      if (!cancelled && data) {
        setCourse((data as any).course);
        setLesson((data as any).lesson);

        lessonService.updateProgress(lessonId!, { opened: true }, { signal: abortController.signal })
          .then(([updatedLesson]) => {
            if (!cancelled && updatedLesson) updateCurrentLesson(updatedLesson);
          });
      } else if (!cancelled && error && error !== 'CanceledError' && error !== 'AbortError') {
        // toast already handled by handleApi
      }
      
      if (!cancelled) setLoading(false);
    }

    if (courseId && lessonId) {
      loadLesson();
    }

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [courseId, lessonId]);

  const allLessons = course?.modules?.flatMap((m: any) => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l: any) => l._id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 && currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;

  return {
    course,
    lesson,
    loading,
    prevLesson,
    nextLesson,
    updateCurrentLesson,
    setLesson
  };
}
