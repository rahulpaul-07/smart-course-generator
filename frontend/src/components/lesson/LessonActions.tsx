import React from 'react';
import { Maximize, Wrench } from 'lucide-react';

interface LessonActionsProps {
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
  toolsAvailable: boolean;
  toolsOpen: boolean;
  onToggleTools: () => void;
}

export function LessonActions({ isFocusMode, setIsFocusMode, toolsAvailable, toolsOpen, onToggleTools }: LessonActionsProps) {
  if (isFocusMode) return null;

  return (
    <div className="hidden md:flex items-center gap-2">
      {toolsAvailable && (
        <button
          onClick={onToggleTools}
          aria-pressed={toolsOpen}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors border ${toolsOpen ? 'border-primary bg-primary/10 text-primary' : 'border-border/30 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Study Tools
        </button>
      )}
      <button
        onClick={() => setIsFocusMode(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs transition-colors border border-border/30"
      >
        <Maximize className="w-3.5 h-3.5" />
        Focus
      </button>
    </div>
  );
}
