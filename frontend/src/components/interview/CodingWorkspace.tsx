import React from 'react';
import { Code2, AlertTriangle, Sparkles, ChevronRight, Brain, CheckCircle2 } from 'lucide-react';
import SyntaxHighlighter from '../../lib/syntaxHighlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import type { InterviewPrep, CodingQuestion } from '../../types';
import { SectionIntro } from './SectionIntro';

const LANGUAGES: { id: string; label: string; test: RegExp }[] = [
  { id: 'sql', label: 'SQL', test: /\b(select|insert|update|delete)\b[\s\S]*\b(from|into|set)\b|\bsql\b/i },
  { id: 'python', label: 'Python', test: /\bdef \w+\(|\bpython\b|^\s*import \w+$/im },
  { id: 'java', label: 'Java', test: /\bpublic (static |class )|\bjava\b/i },
  { id: 'cpp', label: 'C++', test: /#include|\bstd::|\bc\+\+/i },
  { id: 'typescript', label: 'TypeScript', test: /:\s*(string|number|boolean)\b|\binterface \w+|\btypescript\b/i },
  { id: 'javascript', label: 'JavaScript', test: /[\s\S]*/ },
];

/**
 * The language a question expects. Everything was labelled and highlighted as
 * JavaScript, so a SQL question showed a "JavaScript" starter-code badge.
 */
function detectLanguage(q: CodingQuestion) {
  const text = `${q.starterCode || ''}\n${q.title}\n${q.problemStatement}`;
  return LANGUAGES.find((l) => l.test.test(text))!;
}

/** Tab inserts two spaces instead of moving focus out of the editor. */
function insertTabAsSpaces(e: React.KeyboardEvent<HTMLTextAreaElement>, commit: (value: string) => void) {
  if (e.key !== 'Tab' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
  e.preventDefault();
  const el = e.currentTarget;
  const { selectionStart: start, selectionEnd: end, value } = el;
  commit(value.slice(0, start) + '  ' + value.slice(end));
  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
}

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
    <div className="space-y-6">
      <SectionIntro title="Coding" description="Write a working solution. Correctness first, then complexity." />

      {prep.codingQuestions?.map((q: CodingQuestionWithIdealSolution, i: number) => { const lang = detectLanguage(q); return (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/40">
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4 sm:px-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex-1 tracking-tight">{q.title}</h3>
            <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
              Problem {i + 1}
            </span>
          </div>
          
          <div className="space-y-5 p-5 sm:p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-[15px]">
              <p>{q.problemStatement}</p>
            </div>
            
            {q.constraints && (
              <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Constraints</h4>
                <p className="text-sm font-mono text-primary/90 bg-primary/5 p-2 rounded-lg border border-primary/10 inline-block">{q.constraints}</p>
              </div>
            )}
            
            {q.starterCode && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-[#0D0D0D]">
                <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 flex items-center justify-between">
                  <span>Starter Code</span>
                  <span className="text-primary/70">{lang.label}</span>
                </div>
                <div className="overflow-x-auto">
                  <SyntaxHighlighter language={lang.id} style={vscDarkPlus} wrapLongLines={false} customStyle={{ margin: 0, padding: '1rem 1.25rem', background: 'transparent', fontSize: '13px', overflow: 'visible' }}>
                    {q.starterCode}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
            
            <div className="overflow-hidden rounded-2xl border border-border transition-colors focus-within:border-primary/60">
              <div className="flex h-10 items-center justify-between border-b border-white/5 bg-[#161616] px-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Code2 className="w-3.5 h-3.5" /> Your Workspace</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">{lang.label}</span>
              </div>
              <textarea
                value={submitted ? (q.userSolution || '') : codingSolutions[i]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSolution(i, e.target.value)}
                onKeyDown={(e) => insertTabAsSpaces(e, (v) => updateSolution(i, v))}
                disabled={submitted}
                rows={14}
                wrap="off"
                aria-label={`Your solution for ${q.title}`}
                className="block w-full resize-y overflow-x-auto whitespace-pre bg-[#0D0D0D] p-4 font-mono text-[13px] leading-6 text-[#d4d4d4] outline-none [tab-size:2] placeholder:text-muted-foreground disabled:opacity-90"
                placeholder="// Write your optimized solution here..."
                spellCheck={false}
              />
            </div>
            
            {q.solutionHint && !submitted && (
              <details className="group border border-warning/30 bg-warning/5 rounded-xl overflow-hidden transition-all duration-300">
                <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-wider text-warning p-4 hover:bg-warning/10 transition-colors list-none flex items-center justify-between focus-visible:outline-none focus-visible:bg-warning/10">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Need a hint?</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-[14px] text-foreground/80 leading-relaxed border-t border-warning/10 pt-4">
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
                  <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-[#0D0D0D]">
                    <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-success border-b border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Ideal Solution</span>
                      <span>{lang.label}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter language={lang.id} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem 1.25rem', background: 'transparent', fontSize: '13px', overflow: 'visible' }}>
                        {q.idealSolution}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ); })}
    </div>
  );
}
