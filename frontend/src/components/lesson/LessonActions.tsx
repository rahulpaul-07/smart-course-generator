import React from 'react';
import { Maximize, Minimize } from 'lucide-react';

interface LessonActionsProps {
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
}

export function LessonActions({ isFocusMode, setIsFocusMode }: LessonActionsProps) {
  if (isFocusMode) return null;

  return (
    <button 
      onClick={() => setIsFocusMode(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs transition-colors border border-primary/20"
    >
      <Maximize className="w-3.5 h-3.5" />
      Focus
    </button>
  );
}
