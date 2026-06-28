import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBreakdownProps {
  title: string;
  score: number;
  icon: React.ElementType;
  color: 'primary' | 'emerald' | 'cyan';
}

export function ScoreBreakdown({ title, score, icon: Icon, color }: ScoreBreakdownProps) {
  const displayScore = Math.round(score || 0);
  const colors: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
  };
  const barColors: any = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500'
  };
  
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm flex flex-col justify-center hover:shadow-lg transition-all flex-1 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className={`p-2.5 rounded-xl border ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-foreground tracking-tight">{displayScore}</span>
        <span className="text-[13px] text-muted-foreground font-bold tracking-widest">/100</span>
      </div>
      <div className="mt-5 h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40" aria-hidden="true">
        <motion.div 
          className={`h-full rounded-full ${barColors[color]} shadow-[0_0_10px_currentColor] opacity-80`} 
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
