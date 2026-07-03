import React from 'react';
import { CalendarCheck, Target } from 'lucide-react';
import type { Roadmap, RoadmapWeek } from '../../types';
import { calculatePercentage } from '../../utils/percentages';

interface RoadmapStatsProps {
  activeRoadmap: Roadmap;
}

export function RoadmapStats({ activeRoadmap }: RoadmapStatsProps) {
  const weeks = activeRoadmap.weeks || [];
  const completedWeeks = activeRoadmap.completedWeeks || [];
  const totalWeeks = weeks.length;
  const weeksCompleted = weeks.filter((w) => completedWeeks.includes(w.weekNumber)).length;
  const completionPct = totalWeeks > 0 ? calculatePercentage(weeksCompleted, totalWeeks) : 0;

  const totalMilestones = weeks.reduce((acc: number, w: RoadmapWeek) => acc + (w.milestones?.length || 0), 0);
  const milestonesHit = weeks
    .filter((w) => completedWeeks.includes(w.weekNumber))
    .reduce((acc: number, w: RoadmapWeek) => acc + (w.milestones?.length || 0), 0);

  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Progress Summary</h3>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-foreground">Overall Completion</span>
            <span className="text-[13px] font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/30 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weeks Done</span>
              <CalendarCheck className="h-3.5 w-3.5 text-success" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">{weeksCompleted}<span className="text-lg text-muted-foreground">/{totalWeeks}</span></span>
          </div>
          <div className="rounded-2xl border border-border/30 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Milestones</span>
              <Target className="h-3.5 w-3.5 text-success" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">{milestonesHit}<span className="text-lg text-muted-foreground">/{totalMilestones}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
