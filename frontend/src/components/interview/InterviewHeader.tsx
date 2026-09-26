import React from 'react';
import { Brain, Sparkles, Trophy, Trash2, BookOpen } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import type { InterviewPrep } from '../../types';

interface InterviewHeaderProps {
  topic: string;
  setTopic: (t: string) => void;
  generate: (e: React.FormEvent) => void;
  generating: boolean;
  preps: InterviewPrep[];
  viewPrep: (id: string) => void;
  deletePrep: (id: string) => void;
}

export function InterviewHeader({
  topic,
  setTopic,
  generate,
  generating,
  preps,
  viewPrep,
  deletePrep
}: InterviewHeaderProps) {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-12 selection:bg-primary/20">
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-6 max-w-2xl mx-auto pt-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-2 shadow-lg shadow-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground md:text-6xl drop-shadow-sm">
            AI Interview Platform
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto">
            Master your next technical interview. Generate comprehensive mock interviews with MCQs, coding challenges, and a live AI coach.
          </p>
        </section>

        <form onSubmit={generate} className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-primary/30 to-primary/30 opacity-20 blur-xl transition duration-200 group-hover:opacity-40" />
          <div className="relative flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl border border-border shadow-md">
            <input
              aria-label="Interview topic"
              value={topic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              placeholder="E.g. Senior Frontend Engineer, System Design..."
              className="flex-1 h-12 bg-transparent px-5 text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
              maxLength={100}
            />
            <button type="submit" disabled={generating} className={`h-12 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all duration-150 flex items-center justify-center gap-2 whitespace-nowrap shadow-md ${generating ? 'opacity-70 cursor-progress' : ''}`}>
              {generating ? <><LoadingSpinner small /> Preparing...</> : <><Sparkles className="h-4 w-4" /> Generate Mock</>}
            </button>
          </div>
        </form>

        <div className="pt-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Your Active Sessions</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {preps.map((p) => (
              // Open and delete are sibling controls: the delete <button> used
              // to be nested inside the card's <button>, and only appeared on
              // mouse hover, so touch and keyboard users could not reach it.
              <div key={p._id} className="group relative">
                <button
                  type="button"
                  onClick={() => viewPrep(p._id)}
                  className="flex min-h-[160px] w-full flex-col justify-between rounded-2xl border border-border bg-card/40 p-6 pr-14 text-left transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div>
                    <span className={`inline-block rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${p.status === 'completed' ? 'border border-success/20 bg-success/10 text-success' : 'border border-warning/20 bg-warning/10 text-warning'}`}>
                      {p.status === 'completed' ? 'Completed' : 'In progress'}
                    </span>
                    <h4 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug">{p.topic}</h4>
                  </div>
                  {p.status === 'completed' && (
                    <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4 text-success" /> Score <span className="font-semibold text-foreground">{p.overallScore}%</span>
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deletePrep(p._id)}
                  aria-label={`Delete interview: ${p.topic}`}
                  className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {preps.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={BookOpen}
                  title="No interview sessions yet"
                  description="Generate your first mock interview above to start practicing."
                  className="min-h-[250px] bg-card/10 border-border"
                  action={
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                      className="h-10 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Start Interview
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
