import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const EXAMPLES = [
  'A beginner React course with small projects',
  'A practical Python course for data analysis',
  'A DSA interview preparation course',
];

export default function PromptForm({ onSubmit, isLoading = false }: { onSubmit: (val: string) => Promise<boolean>, isLoading?: boolean }) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    const succeeded = await onSubmit(value);
    if (succeeded !== false) setPrompt('');
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 bg-card/40 backdrop-blur-2xl border-white/5 ${isFocused ? 'ring-2 ring-primary/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/20' : 'hover:border-primary/30 hover:bg-card/60'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="block p-4 sm:p-6 pb-2 relative">
          <label htmlFor="course-prompt" className="sr-only">What course do you want to create?</label>
          <textarea
            id="course-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="I want to master product design, from fundamentals to a portfolio project..."
            disabled={isLoading}
            maxLength={2000}
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-4">
          <AnimatePresence>
            {!prompt && EXAMPLES.map((example, i) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              >
                {example}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/30 bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            AI builds the complete curriculum
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className={`relative overflow-hidden group rounded-full px-6 transition-all ${isLoading ? 'cursor-progress opacity-90' : 'hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5'}`}
          >
            <span className="relative z-10 flex items-center font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Course
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
            {/* Hover highlight effect */}
            {!isLoading && <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />}
            {!isLoading && <div className="absolute inset-0 bg-foreground/10 translate-y-full transition-transform group-hover:translate-y-0" />}
          </Button>
        </div>
      </form>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-xl"
          >
            {/* Moving gradient orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
            <div className="absolute inset-0 z-0 bg-[linear-gradient(110deg,transparent,rgba(var(--primary),0.15),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
            
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-primary/40 animate-pulse" />
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-card to-background border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] relative z-10 animate-float">
                  <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2 text-center">
                <h4 className="text-xl font-bold text-foreground font-display bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 animate-pulse">Crafting Your Journey</h4>
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Generating AI curriculum...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
