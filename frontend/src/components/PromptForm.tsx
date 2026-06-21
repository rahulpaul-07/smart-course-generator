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
    <Card className={`relative overflow-hidden transition-all duration-500 bg-card/60 backdrop-blur ${isFocused ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : 'hover:border-primary/30'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="block p-4 sm:p-6 pb-2 relative">
          <span className="sr-only">What course do you want to create?</span>
          <textarea
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
        </label>

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

        <div className="flex items-center justify-between gap-4 border-t border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            AI builds the complete curriculum
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create Course
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
            {/* Hover highlight effect */}
            {!isLoading && <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />}
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
            className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-sm font-medium animate-pulse text-primary">Designing your personalized journey...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
