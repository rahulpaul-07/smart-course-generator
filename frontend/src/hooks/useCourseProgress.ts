import { useState, useEffect, useCallback } from 'react';
import { Code2, Layers3, Shield, Brain, BookOpen } from 'lucide-react';
import { courseService } from '../services/courseService';
import { courseProgress } from '../utils/courseProgress';
import { calculateEstimatedHours } from '../utils/durations';
import type { PopulatedCourse } from '../types';

export function useCourseProgress(id: string | undefined) {
  const [course, setCourse] = useState<PopulatedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(() => {
    let active = true;
    // Deferred to a microtask so this reads as a callback invocation rather
    // than a synchronous setState call within the effect body.
    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      setError(null);

      courseService.getCourse(id!).then(([data, err]) => {
        if (!active) return;
        if (err) {
          setError(err);
        } else if (data) {
          setCourse(data);
        }
        setLoading(false);
      });
    });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    return fetchCourse();
  }, [fetchCourse]);

  if (!course) {
    return { course, loading, error, progress: null, estimatedHours: 0, difficulty: '', skills: [], nextLessonId: null, setCourse, refetch: fetchCourse };
  }

  const progress = courseProgress(course);
  
  const totalLessons = progress.totalLessons || 0;
  const estimatedHours = calculateEstimatedHours(totalLessons);
  
  // The Course schema has no difficulty field yet; default until that's added.
  const difficulty = 'Intermediate';

  const title = course.title || '';
  const skills = [
    { name: title.split(' ')[0] || 'Fundamentals', icon: Code2 },
    { name: 'System Design', icon: Layers3 },
    { name: 'Best Practices', icon: Shield },
    { name: 'Problem Solving', icon: Brain },
    { name: 'Architecture', icon: BookOpen }
  ].slice(0, Math.max(3, Math.min(5, Math.ceil(totalLessons / 3))));

  let nextLessonId = null;
  const modules = course?.modules ?? [];
  for (const mod of modules) {
    const uncompleted = mod.lessons?.find((l) => !l.completedAt);
    if (uncompleted) {
      nextLessonId = uncompleted._id;
      break;
    }
  }
  if (!nextLessonId && modules?.[0]?.lessons?.[0]) {
    nextLessonId = modules[0].lessons[0]._id;
  }

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
    progress,
    estimatedHours,
    difficulty,
    skills,
    nextLessonId,
    setCourse
  };
}
