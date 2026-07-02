import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, Brain, BarChart3 } from 'lucide-react';

export function RoadmapActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <button onClick={() => navigate('/courses')} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/50 hover:bg-muted hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">Browse My Courses</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>

        <button onClick={() => navigate('/interview-prep')} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/50 hover:bg-muted hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">Interview Prep</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>

        <button onClick={() => navigate('/analytics')} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/50 hover:bg-muted hover:border-cyan-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">View Analytics</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}
