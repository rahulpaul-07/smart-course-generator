import { useState } from 'react';

export function useRoadmapProgress(initialExpanded = new Set([1])) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(initialExpanded);

  function toggleWeek(num: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  }

  return {
    expandedWeeks,
    toggleWeek
  };
}
