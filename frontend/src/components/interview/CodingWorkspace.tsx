import React from 'react';
import { Code2, AlertTriangle, Sparkles, ChevronRight, Brain, CheckCircle2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { InterviewPrep, CodingQuestion } from '../../types';

interface CodingWorkspaceProps {
  prep: InterviewPrep;
  codingSolutions: string[];
  setCodingSolutions: (answers: string[]) => void;
  submitted: boolean;
}

/** The backend may include an `idealSolution` field on completed coding
 * questions that is not part of the shared `CodingQuestion` type. */
type CodingQuestionWithIdealSolution = CodingQuestion & { idealSolution?: string };

export function CodingWorkspace({ prep, codingSolutions, setCodingSolutions, submitted }: CodingWorkspaceProps) {
  function updateSolution(i: number, val: string) {
    const s = [...codingSolutions];
    s[i] = val;
    setCodingSolutions(s);
  }

  return (
    <div className="space-y-10">
      <div className="mb-10 pb-6 border-b border-border/30">
        <h2 className="text-3xl font-extrabold font-serif tracking-tight text-foreground mb-2">Coding Challenges</h2>
        <p className="text-muted-foreground font-medium">Write clean, optimized, and robust code.</p>
      </div>

      {prep.codingQuestions?.map((q: CodingQuestionWithIdealSolution, i: number) => (
        <div key={i} className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md shadow-sm overflow-hidden flex flex-col transition-all">
          <div className="border-b border-border/30 bg-muted/40 p-5 px-8 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex-1 tracking-tight">{q.title}</h3>
            <span className="rounded-lg border border-border/30 bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
              Problem {i + 1}
            </span>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed text-[15px]">
              <p>{q.problemStatement}</p>
            </div>
            
            {q.constraints && (
              <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Constraints</h4>
                <p className="text-sm font-mono text-primary/90 bg-primary/5 p-2 rounded-lg border border-primary/10 inline-block">{q.constraints}</p>
              </div>
            )}
            
            {q.starterCode && (
              <div className="rounded-2xl overflow-hidden border border-border/30 shadow-lg bg-[#0D0D0D]">
                <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 flex items-center justify-between">
                  <span>Starter Code</span>
                  <span className="text-primary/70">JavaScript</span>
                </div>
                <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}>
                  {q.starterCode}
                </SyntaxHighlighter>
              </div>
            )}
            
            <div className="relative rounded-2xl overflow-hidden border-2 border-border/30 shadow-inner group transition-colors focus-within:border-primary/50">
              <div className="absolute top-0 right-0 left-0 h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-5 justify-between z-10">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Code2 className="w-3.5 h-3.5" /> Your Workspace</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">JS</span>
              </div>
              <textarea
                value={submitted ? (q.userSolution || '') : codingSolutions[i]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSolution(i, e.target.value)}
                disabled={submitted}
                rows={12}
                className="w-full bg-[#0D0D0D] p-5 pt-16 text-[14px] font-mono leading-relaxed text-emerald-400 outline-none resize-y disabled:opacity-90 placeholder:text-muted-foreground/30 relative z-0"
                placeholder="// Write your optimized solution here..."
                spellCheck={false}
              />
            </div>
            
            {q.solutionHint && !submitted && (
              <details className="group border border-amber-500/30 bg-amber-500/5 rounded-xl overflow-hidden transition-all duration-300">
                <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-wider text-amber-500 p-4 hover:bg-amber-500/10 transition-colors list-none flex items-center justify-between focus-visible:outline-none focus-visible:bg-amber-500/10">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Need a hint?</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-[14px] text-foreground/80 leading-relaxed border-t border-amber-500/10 pt-4">
                  {q.solutionHint}
                </div>
              </details>
            )}

            {submitted && q.feedback && (
              <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-4">
                  <h4 className="font-bold text-[13px] uppercase tracking-widest text-primary flex items-center gap-2"><Brain className="w-4 h-4" /> Code Evaluation</h4>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md shadow-sm">Score: {q.score}/10</span>
                </div>
                <p className="text-[14px] text-foreground/90 leading-relaxed mb-6">{q.feedback}</p>
                {q.idealSolution && (
                  <div className="rounded-2xl overflow-hidden border border-border/30 shadow-lg bg-[#0D0D0D]">
                    <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-500 border-b border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Ideal Solution</span>
                      <span>JavaScript</span>
                    </div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}>
                      {q.idealSolution}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
