import React from 'react';
import { Clock } from 'lucide-react';

interface TimerPanelProps {
  status: string;
  formattedTime: string;
}

export function TimerPanel({ status, formattedTime }: TimerPanelProps) {
  if (status !== 'pending') return null;

  return (
    <div className="mb-10 rounded-xl bg-background border border-border/30 p-4 shadow-sm flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Time
      </span>
      <span className="font-mono text-sm font-bold text-primary">{formattedTime}</span>
    </div>
  );
}
