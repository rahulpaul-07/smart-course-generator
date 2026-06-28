import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TerminalSquare, Brain, MessageSquare } from 'lucide-react';

export function RoadmapActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <TerminalSquare className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">Generate Practice Lab</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
        
        <button onClick={() => navigate('/interview-prep')} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">Interview Prep</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
        
        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-cyan-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-bold text-foreground">Ask AI Tutor</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}
