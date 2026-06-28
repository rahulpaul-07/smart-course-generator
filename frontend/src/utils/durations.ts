export function calculateEstimatedHours(lessons: number): number {
  return Math.max(1, Math.round((lessons * 15) / 60));
}

export function calculateStudiedHours(completedLessons: number): number {
  return Math.round((completedLessons * 15 / 60) * 10) / 10;
}
