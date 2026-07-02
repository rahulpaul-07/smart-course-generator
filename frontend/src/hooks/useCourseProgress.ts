import { useState, useEffect, useCallback } from 'react';
import { Code2, Layers3, Shield, Brain, BookOpen, Sparkles } from 'lucide-react';
import { courseService } from '../services/courseService';
import { courseProgress } from '../utils/courseProgress';
import { calculateEstimatedHours } from '../utils/durations';
import type { PopulatedCourse } from '../types';

/** The Course schema gained `difficulty`/`skills` after this hook shipped;
 * cast locally (rather than widening the shared Course type) since only
 * this hook reads them today. */
type CourseWithGeneratedMeta = PopulatedCourse & { difficulty?: string; skills?: string[] };

const SKILL_ICONS = [Code2, Layers3, Shield, Brain, BookOpen, Sparkles];

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

  const courseMeta = course as CourseWithGeneratedMeta;
  // Real difficulty/skills come from the AI-generated outline. Courses
  // created before that field existed genuinely have no value stored, so
  // fall back to the same neutral defaults used elsewhere (CourseCard).
  const difficulty = courseMeta.difficulty || 'Intermediate';
  const skills = (courseMeta.skills || [])
    .filter(Boolean)
    .map((name, i) => ({ name, icon: SKILL_ICONS[i % SKILL_ICONS.length] }));

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
