import React from 'react';
import { Trophy, CheckCircle2, BookOpen, Code2, Zap, AlertTriangle, Brain, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoreBreakdown } from './ScoreBreakdown';

interface ResultsDashboardProps {
  prep: any;
  readiness: string;
  strengths: string[];
  weaknesses: string[];
  aiRec: string;
}

export function ResultsDashboard({ prep, readiness, strengths, weaknesses, aiRec }: ResultsDashboardProps) {
  return (
    <div className="space-y-10 animate-enter pb-16">
      <div className="text-center space-y-4 mb-16 pt-4">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/20 mb-4 border border-white/10">
          <Trophy className="h-12 w-12 text-primary-foreground" />
        </div>
        <h2 className="text-5xl font-extrabold font-serif tracking-tight text-foreground drop-shadow-sm">Assessment Complete</h2>
        <p className="text-lg text-muted-foreground font-medium">Comprehensive evaluation and personalized feedback</p>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl p-10 flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-8 z-10">Overall Score</h3>
          <div className="relative flex h-48 w-48 items-center justify-center mb-8 z-10">
            <svg className="h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
              <circle className="text-muted/50 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent" />
              <motion.circle
                className="text-primary stroke-current"
                strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="44" fill="transparent"
                initial={{ strokeDasharray: "276.46", strokeDashoffset: "276.46" }}
                animate={{ strokeDashoffset: 276.46 - (276.46 * prep.overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-foreground tracking-tighter">{prep.overallScore}<span className="text-2xl text-muted-foreground">%</span></span>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2 z-10 tracking-tight">{readiness}</p>
        </div>

        <div className="flex flex-col gap-4">
          <ScoreBreakdown title="MCQ Accuracy" score={prep.mcqScore} icon={CheckCircle2} color="primary" />
          <ScoreBreakdown title="Theory Depth" score={prep.theoryScore} icon={BookOpen} color="emerald" />
          <ScoreBreakdown title="Code Quality" score={prep.codingQuestions?.reduce((s:any, q:any) => s + (q.score||0), 0) / (prep.codingQuestions?.length || 1) * 10} icon={Code2} color="cyan" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6"><Zap className="h-4 w-4" /> Demonstrated Strengths</h3>
          <ul className="space-y-4">
            {strengths.length > 0 ? strengths.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-destructive mb-6"><AlertTriangle className="h-4 w-4" /> Areas for Improvement</h3>
          <ul className="space-y-4">
            {weaknesses.length > 0 ? weaknesses.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-10 shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-6"><Brain className="h-6 w-6 text-primary" /> Comprehensive Evaluation</h3>
        <p className="text-[16px] text-muted-foreground font-medium leading-relaxed mb-10 max-w-4xl">{aiRec}</p>
        
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-border/30">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Communication</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.communicationFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Technical Depth</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.technicalFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Problem Solving</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.problemSolvingFeedback || 'Not evaluated.'}</p>
          </div>
        </div>
      </div>

      {prep.nextSteps && prep.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-border/30 bg-card/50 p-8 shadow-sm">
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-foreground mb-6">Recommended Next Steps</h4>
          <ul className="space-y-3 text-[14px] font-medium text-muted-foreground list-disc pl-5">
            {prep.nextSteps.map((step:string, i:number) => <li key={i} className="pl-2">{step}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
