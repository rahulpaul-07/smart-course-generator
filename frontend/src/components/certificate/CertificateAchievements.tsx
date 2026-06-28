import React from 'react';
import { Clock, GraduationCap, Briefcase, Target } from 'lucide-react';

export function CertificateAchievements() {
  return (
    <div className="md:col-span-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Course Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <Clock className="w-5 h-5 text-primary mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">12<span className="text-sm text-muted-foreground font-medium">h</span></p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Study Time</p>
        </div>
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <GraduationCap className="w-5 h-5 text-emerald-500 mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">100<span className="text-sm text-muted-foreground font-medium">%</span></p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lessons</p>
        </div>
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <Briefcase className="w-5 h-5 text-amber-500 mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">4</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
        </div>
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <Target className="w-5 h-5 text-cyan-500 mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">98<span className="text-sm text-muted-foreground font-medium">/100</span></p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interview</p>
        </div>
      </div>
    </div>
  );
}
