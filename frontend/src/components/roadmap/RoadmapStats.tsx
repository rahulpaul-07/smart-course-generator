import React from 'react';
import { Flame, Target } from 'lucide-react';

interface RoadmapStatsProps {
  activeRoadmap: any;
}

export function RoadmapStats({ activeRoadmap }: RoadmapStatsProps) {
  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Progress Summary</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-foreground">Overall Completion</span>
            <span className="text-[13px] font-bold text-primary">0%</span>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
            <div className="h-full bg-primary w-[0%]" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/30 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Streak</span>
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">0 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">days</span></span>
          </div>
          <div className="rounded-2xl border border-border/30 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Milestones</span>
              <Target className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">0<span className="text-lg text-muted-foreground">/{activeRoadmap.weeks?.reduce((acc: number, w: any) => acc + (w.milestones?.length || 0), 0) || 0}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
