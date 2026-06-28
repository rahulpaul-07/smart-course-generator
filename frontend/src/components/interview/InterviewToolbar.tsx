import React from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface InterviewToolbarProps {
  activePrep: any;
  setActivePrep: (prep: any) => void;
  formattedTime: string;
  setIsMobileCoachOpen: (open: boolean) => void;
}

export function InterviewToolbar({ activePrep, setActivePrep, formattedTime, setIsMobileCoachOpen }: InterviewToolbarProps) {
  return (
    <div className="lg:hidden sticky top-0 z-20 w-full bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => setActivePrep(null)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold text-foreground truncate text-sm">{activePrep.topic}</span>
      </div>
      <div className="flex items-center gap-2">
        {activePrep.status === 'pending' && (
          <span className="font-mono text-xs font-bold text-primary mr-2">{formattedTime}</span>
        )}
        <button 
          onClick={() => setIsMobileCoachOpen(true)} 
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
