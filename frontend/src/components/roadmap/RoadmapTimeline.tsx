import React from 'react';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';
import { RoadmapWeekCard } from './RoadmapWeekCard';

interface RoadmapTimelineProps {
  roadmap: any;
  onGenerateCourse: (topic: string) => void;
}

export function RoadmapTimeline({ roadmap, onGenerateCourse }: RoadmapTimelineProps) {
  const { expandedWeeks, completedWeeks, savingWeeks, toggleWeek, toggleCompletion } = useRoadmapProgress(new Set([1]));
  const weeks = roadmap.weeks || [];

  return (
    <div className="relative">
      {/* Absolute Timeline Line */}
      <div className="absolute left-[31px] top-8 bottom-8 w-[2px] bg-border/60" />

      <div className="space-y-6">
        {weeks.map((week: any, index: number) => {
          const isExpanded = expandedWeeks.has(week.weekNumber);
          const isCompleted = completedWeeks.has(week.weekNumber);
          const isSaving = savingWeeks.has(week.weekNumber);
          const isCurrent = !isCompleted && (index === 0 || completedWeeks.has(weeks[index - 1]?.weekNumber));
          
          return (
            <RoadmapWeekCard
              key={`${roadmap._id}-${index}`}
              roadmap={roadmap}
              week={week}
              index={index}
              isExpanded={isExpanded}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isSaving={isSaving}
              toggleWeek={toggleWeek}
              toggleCompletion={toggleCompletion}
              onGenerateCourse={onGenerateCourse}
            />
          );
        })}
      </div>
    </div>
  );
}
