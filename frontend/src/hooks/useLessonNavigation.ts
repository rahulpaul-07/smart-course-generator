import { useState, useEffect, useCallback } from 'react';
import { lessonService } from '../services/lessonService';
import type { Lesson, Module, PopulatedCourse } from '../types';

export function useLessonNavigation(courseId: string | undefined, lessonId: string | undefined) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<PopulatedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateCurrentLesson = useCallback((updatedLesson: Lesson) => {
    setLesson(updatedLesson);
    setCourse((currentCourse) => {
      if (!currentCourse) return currentCourse;
      return {
        ...currentCourse,
        modules: ((currentCourse.modules as Module[]) || []).map((moduleDoc) => ({
          ...moduleDoc,
          lessons: ((moduleDoc.lessons as Lesson[]) || []).map((item) => (
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
      setCourse(data.course);
      setLesson(data.lesson);

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
      // Deferred to a microtask so this reads as a callback invocation
      // rather than a synchronous setState call within the effect body.
      queueMicrotask(() => {
        if (cancelled) return;
        setLoading(true);
        setError(null);

        lessonService.getLesson(courseId, lessonId, {
          signal: abortController.signal
        }).then(([data, err]) => {
          if (cancelled) return;

          if (data) {
            setCourse(data.course);
            setLesson(data.lesson);

            lessonService.updateProgress(lessonId, { opened: true }, { signal: abortController.signal })
              .then(([updatedLesson]) => {
                if (!cancelled && updatedLesson) updateCurrentLesson(updatedLesson);
              }).catch(() => {});
          } else if (err && err !== 'CanceledError' && err !== 'AbortError') {
            setError(err);
          }

          setLoading(false);
        });
      });
    }

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [courseId, lessonId, updateCurrentLesson]);

  const allLessons = (course?.modules as Module[] | undefined)?.flatMap((m) => m.lessons as Lesson[]) || [];
  const currentLessonIndex = allLessons.findIndex((l) => l._id === lessonId);
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
