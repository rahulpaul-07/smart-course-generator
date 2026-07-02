import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lessonService';
import type { Lesson, Module, PopulatedCourse } from '../types';

interface LessonQueryResult {
  course: PopulatedCourse;
  lesson: Lesson;
}

export function useLessonNavigation(courseId: string | undefined, lessonId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['lesson', courseId, lessonId];
  const openedLessonRef = useRef<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<LessonQueryResult>({
    queryKey,
    queryFn: async ({ signal }) => {
      const [result, err] = await lessonService.getLesson(courseId!, lessonId!, { signal });
      if (err) throw new Error(err);
      return result!;
    },
    enabled: Boolean(courseId && lessonId),
  });

  const course = data?.course ?? null;
  const lesson = data?.lesson ?? null;

  const updateCurrentLesson = useCallback((updatedLesson: Lesson) => {
    queryClient.setQueryData<LessonQueryResult>(queryKey, (current) => {
      if (!current) return current;
      return {
        course: {
          ...current.course,
          modules: ((current.course.modules as Module[]) || []).map((moduleDoc) => ({
            ...moduleDoc,
            lessons: ((moduleDoc.lessons as Lesson[]) || []).map((item) => (
              item._id === updatedLesson._id ? updatedLesson : item
            )),
          })),
        },
        lesson: current.lesson._id === updatedLesson._id ? updatedLesson : current.lesson,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, queryClient]);

  const setLesson: Dispatch<SetStateAction<Lesson | null>> = useCallback((value) => {
    queryClient.setQueryData<LessonQueryResult>(queryKey, (current) => {
      if (!current) return current;
      const nextLesson = typeof value === 'function'
        ? (value as (prev: Lesson | null) => Lesson | null)(current.lesson)
        : value;
      if (!nextLesson) return current;
      return { ...current, lesson: nextLesson };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, queryClient]);

  useEffect(() => {
    if (!data || !lessonId) return;
    if (openedLessonRef.current === lessonId) return;
    openedLessonRef.current = lessonId;

    lessonService.updateProgress(lessonId, { opened: true })
      .then(([updatedLesson]) => {
        if (updatedLesson) updateCurrentLesson(updatedLesson);
      }).catch(() => {});
  }, [data, lessonId, updateCurrentLesson]);

  const allLessons = (course?.modules as Module[] | undefined)?.flatMap((m) => m.lessons as Lesson[]) || [];
  const currentLessonIndex = allLessons.findIndex((l) => l._id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 && currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;

  return {
    course,
    lesson,
    loading: isLoading,
    error: isError ? (error instanceof Error ? error.message : 'Failed to load lesson') : null,
    refetch,
    prevLesson,
    nextLesson,
    updateCurrentLesson,
    setLesson
  };
}
