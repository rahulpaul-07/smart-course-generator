import React from 'react';
import { ArrowLeft, Bot, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  lessonTitle: string;
  hasMessages: boolean;
  onClearChat: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function ChatHeader({ lessonTitle, hasMessages, onClearChat, onBack, onClose }: ChatHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border/30 bg-card/50 backdrop-blur-xl px-5 py-4 z-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to study tools"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-foreground leading-none mb-1.5 tracking-tight">AI Tutor</h2>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{lessonTitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasMessages && (
          <Button variant="ghost" size="icon" onClick={onClearChat} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close chat">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
