import { calculatePercentage } from './percentages';
import type { PopulatedCourse, Lesson } from '../types';

export function courseProgress(course: PopulatedCourse | null | undefined) {
  if (!course) {
    return {
      completedLessons: 0,
      completionDate: null as string | null,
      percentage: 0,
      remainingLessons: 0,
      totalLessons: 0,
    };
  }

  let totalLessons = 0;
  let completedLessons = 0;
  let completionDate: string | null = null;

  const modules = course?.modules ?? [];
  for (const moduleDoc of modules) {
    const lessons = moduleDoc.lessons ?? [];
    for (const lesson of lessons) {
      totalLessons += 1;
      if (lesson.completedAt) {
        completedLessons += 1;
        if (!completionDate || new Date(lesson.completedAt) > new Date(completionDate)) {
          completionDate = lesson.completedAt;
        }
      }
    }
  }

  const percentage = calculatePercentage(completedLessons, totalLessons);

  return {
    completedLessons,
    completionDate,
    percentage,
    remainingLessons: totalLessons - completedLessons,
    totalLessons,
  };
}

export function nextIncompleteLesson(course: PopulatedCourse | null | undefined) {
  if (!course) return null;

  const modules = course?.modules ?? [];
  for (const moduleDoc of modules) {
    const lessons = moduleDoc.lessons ?? [];
    for (const lesson of lessons) {
      if (!lesson.completedAt) {
        return {
          ...lesson,
          moduleTitle: moduleDoc.title,
        };
      }
    }
  }

  return null;
}

export function mostRecentLesson(courses: PopulatedCourse[] | null | undefined) {
  if (!courses) return null;

  let recent: (Lesson & { courseId?: string; courseTitle?: string; moduleTitle?: string }) | null = null;

  for (const course of courses) {
    if (!course) continue;
    const modules = course?.modules ?? [];
    for (const moduleDoc of modules) {
      const lessons = moduleDoc.lessons ?? [];
      for (const lesson of lessons) {
        if (!lesson.lastOpenedAt) continue;
        if (!recent || !recent.lastOpenedAt || new Date(lesson.lastOpenedAt) > new Date(recent.lastOpenedAt)) {
          recent = {
            ...lesson,
            courseId: course._id,
            courseTitle: course.title,
            moduleTitle: moduleDoc.title,
          };
        }
      }
    }
  }

  return recent;
}
