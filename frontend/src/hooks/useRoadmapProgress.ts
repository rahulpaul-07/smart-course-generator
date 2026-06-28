import { useState } from 'react';

export function useRoadmapProgress(initialExpanded = new Set([1])) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(initialExpanded);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());

  function toggleWeek(num: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  function toggleCompletion(e: any, num: number) {
    e.stopPropagation();
    setCompletedWeeks(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  return {
    expandedWeeks,
    completedWeeks,
    toggleWeek,
    toggleCompletion
  };
}
