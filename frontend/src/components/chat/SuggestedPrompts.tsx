import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquarePlus } from 'lucide-react';

const SUGGESTIONS = [
  "Can you explain that more simply?",
  "Give me a real-world example.",
  "How does this connect to the previous topic?",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center px-4 max-w-sm mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-inner border border-primary/20">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3 font-serif">How can I help you?</h3>
      <p className="text-sm font-medium text-muted-foreground mb-10 leading-relaxed">
        Ask me to explain concepts, provide examples, or help you understand this lesson better.
      </p>
      
      <div className="w-full space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center justify-center gap-2">
          <MessageSquarePlus className="h-3 w-3" /> Suggested questions
        </p>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="w-full text-left px-5 py-3 rounded-xl border border-border/30 bg-muted/20 text-[13px] font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
