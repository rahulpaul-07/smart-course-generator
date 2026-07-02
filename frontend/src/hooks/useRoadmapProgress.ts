import { useState } from 'react';
import type { MouseEvent } from 'react';

export function useRoadmapProgress(initialExpanded = new Set([1])) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(initialExpanded);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  // setSavingWeeks is currently unused: there is no roadmap-progress persistence
  // endpoint yet, so completion toggles are optimistic/local-only (see below).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [savingWeeks, setSavingWeeks] = useState<Set<number>>(new Set());

  function toggleWeek(num: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  }

  async function toggleCompletion(e: MouseEvent<HTMLButtonElement>, num: number) {
    e.stopPropagation();
    
    // If an actual API call is added later, it should replace the fake delay.
    // For now, we perform an immediate optimistic update.
    
    setCompletedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
    
    // Re-enable this when a real async request is added:
    // setSavingWeeks(prev => {
    //   const next = new Set(prev);
    //   next.delete(num);
    //   return next;
    // });
  }

  return {
    expandedWeeks,
    completedWeeks,
    savingWeeks,
    toggleWeek,
    toggleCompletion
  };
}
