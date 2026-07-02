import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import type { InterviewPrep, TheoryQuestion } from '../../types';

interface TheoryWorkspaceProps {
  prep: InterviewPrep;
  theoryAnswers: string[];
  setTheoryAnswers: (answers: string[]) => void;
  submitted: boolean;
}

export function TheoryWorkspace({ prep, theoryAnswers, setTheoryAnswers, submitted }: TheoryWorkspaceProps) {
  function updateAnswer(i: number, val: string) {
    const a = [...theoryAnswers];
    a[i] = val;
    setTheoryAnswers(a);
  }

  return (
    <div className="space-y-10">
      <div className="mb-10 pb-6 border-b border-border/30">
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-foreground mb-2">Theory & Concepts</h2>
        <p className="text-muted-foreground font-medium">Provide detailed, comprehensive answers.</p>
      </div>

      {prep.theoryQuestions?.map((q: TheoryQuestion, i: number) => {
        const textValue = submitted ? (q.userAnswer || '') : theoryAnswers[i];
        const wordCount = textValue.trim().split(/\s+/).filter(Boolean).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        
        return (
          <div key={i} className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md p-8 shadow-sm flex flex-col gap-6">
            <p className="text-[15px] font-semibold text-foreground leading-relaxed flex items-start gap-4">
              <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm mt-0.5">
                {i + 1}
              </span>
              <span className="pt-1.5">{q.question}</span>
            </p>
            <div className="relative pl-12">
              <textarea
                value={textValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAnswer(i, e.target.value)}
                disabled={submitted}
                rows={8}
                className="w-full rounded-2xl border border-border bg-background/50 p-5 text-[15px] leading-relaxed text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner resize-y disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                placeholder="Structure your answer clearly. Consider using bullet points or real-world examples..."
              />
              {!submitted && (
                <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30 shadow-sm pointer-events-none">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> ~{readTime}m read</span>
                  <span className={`flex items-center gap-1.5 ${wordCount < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    <BookOpen className="w-3 h-3" /> {wordCount} words
                  </span>
                </div>
              )}
            </div>
            
            {submitted && q.feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 ml-12 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/30 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Evaluation</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${(q.score ?? 0) >= 7 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : (q.score ?? 0) >= 4 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    Score: {q.score}/10
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-foreground/90">{q.feedback}</p>
                {q.idealAnswer && (
                  <details className="group mt-6 border border-border rounded-xl bg-background/50 overflow-hidden">
                    <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-wider text-primary p-4 hover:bg-muted/50 list-none flex justify-between items-center transition-colors focus-visible:outline-none focus-visible:bg-muted">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> View Ideal Answer</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div className="p-5 border-t border-border/30 text-[14px] leading-relaxed text-muted-foreground bg-background">
                      {q.idealAnswer}
                    </div>
                  </details>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
