import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BookOpen, Award } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import type { InterviewPrep, MCQQuestion } from '../../types';

interface MCQWorkspaceProps {
  prep: InterviewPrep;
  mcqAnswers: number[];
  setMcqAnswers: (answers: number[]) => void;
  submitted: boolean;
  submitting: boolean;
  submitAssessment: () => void;
}

export function MCQWorkspace({ prep, mcqAnswers, setMcqAnswers, submitted, submitting, submitAssessment }: MCQWorkspaceProps) {
  return (
    <div className="space-y-8">
      <div className="mb-10 pb-6 border-b border-border/30">
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-foreground mb-2">Multiple Choice</h2>
        <p className="text-muted-foreground font-medium">Select the best answer for each question.</p>
      </div>
      
      {prep.mcqs?.map((q: MCQQuestion, i: number) => {
        const userAns = submitted ? q.userAnswer : mcqAnswers[i];
        return (
          <div key={i} className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md p-8 shadow-sm transition-all hover:shadow-md">
            <p className="mb-6 text-[15px] font-semibold text-foreground leading-relaxed flex items-start gap-4">
              <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm mt-0.5">
                {i + 1}
              </span>
              <span className="pt-1.5">{q.question}</span>
            </p>
            <div className="space-y-3 pl-12">
              {q.options.map((opt: string, oi: number) => {
                const isSelected = userAns === oi;
                const isCorrect = submitted && oi === q.correctAnswer;
                const isWrong = submitted && oi === userAns && oi !== q.correctAnswer;
                
                let cls = 'border-border/30 bg-background hover:border-primary/40 hover:bg-muted/50 text-foreground';
                if (submitted) {
                  if (isCorrect) cls = 'border-success bg-success/10 text-success dark:text-success font-medium';
                  else if (isWrong) cls = 'border-destructive bg-destructive/10 text-destructive font-medium';
                  else cls = 'border-border/30 bg-background/50 opacity-40';
                } else if (isSelected) {
                  cls = 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary/20 shadow-sm';
                }

                return (
                  <button
                    key={oi}
                    onClick={() => { if (!submitted) { const a = [...mcqAnswers]; a[i] = oi; setMcqAnswers(a); } }}
                    disabled={submitted}
                    className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${cls}`}
                  >
                    <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${isSelected && !submitted ? 'bg-primary border-primary text-primary-foreground' : 'border-border/30 text-muted-foreground'} ${isCorrect ? 'bg-success border-success text-background' : ''} ${isWrong ? 'bg-destructive border-destructive text-background' : ''}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="pt-0.5 flex-1 leading-relaxed">{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-success absolute right-4 top-4" />}
                    {isWrong && <XCircle className="h-5 w-5 shrink-0 text-destructive absolute right-4 top-4" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 ml-12 rounded-xl border border-primary/20 bg-primary/5 p-5 text-[14px] leading-relaxed text-foreground/90">
                <span className="font-bold text-primary mb-2 block flex items-center gap-2"><BookOpen className="w-4 h-4" /> Explanation</span>
                {q.explanation}
              </motion.div>
            )}
          </div>
        );
      })}
      
      {!submitted && prep.mcqs?.length > 0 && (
        <div className="pt-8 border-t border-border/30 sticky bottom-0 z-10 bg-background/95 backdrop-blur-xl pb-8 flex justify-end">
          <button onClick={submitAssessment} disabled={submitting} className={`h-12 bg-foreground text-background px-8 rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-lg ${submitting ? 'cursor-progress opacity-70' : ''}`}>
            {submitting ? <><LoadingSpinner small /> Evaluating...</> : <><Award className="h-5 w-5" /> Submit Assessment</>}
          </button>
        </div>
      )}
    </div>
  );
}
