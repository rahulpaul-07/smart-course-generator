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
          <h1 className="font-serif text-5xl font-extrabold tracking-tight text-foreground md:text-6xl drop-shadow-sm">
            AI Interview Platform
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto">
            Master your next technical interview. Generate comprehensive mock interviews with MCQs, coding challenges, and a live AI coach.
          </p>
        </section>

        <form onSubmit={generate} className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-cyan-400/30 to-primary/30 opacity-20 blur-xl transition duration-200 group-hover:opacity-40" />
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
              <button type="button" key={p._id} onClick={() => viewPrep(p._id)} className="group cursor-pointer rounded-2xl border border-border/30 bg-card/40 p-6 transition-all duration-300 hover:bg-card hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 flex flex-col justify-between min-h-[180px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 w-full">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                      {p.status}
                    </span>
                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); deletePrep(p._id); }} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-lg text-foreground line-clamp-2 leading-snug">{p.topic}</h4>
                </div>
                {p.status === 'completed' && (
                  <div className="mt-6 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm text-muted-foreground font-semibold">Score: <span className="text-foreground">{p.overallScore}%</span></p>
                  </div>
                )}
              </button>
            ))}
            {preps.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={BookOpen}
                  title="No interview sessions yet"
                  description="Generate your first mock interview above to start practicing."
                  className="min-h-[250px] bg-card/10 border-border/30"
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
