import React from 'react';
import { Trophy, CheckCircle2, BookOpen, Code2, Zap, AlertTriangle, Brain, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoreBreakdown } from './ScoreBreakdown';
import type { InterviewPrep, CodingQuestion } from '../../types';

/** The backend may include aggregate `mcqScore` / `theoryScore` fields on
 * completed interview preps that are not part of the shared `InterviewPrep`
 * type. Narrowly extended here rather than widening the shared type, since
 * these fields are only known to be produced for completed assessments. */
type InterviewPrepWithSubScores = InterviewPrep & {
  mcqScore?: number;
  theoryScore?: number;
};

interface ResultsDashboardProps {
  prep: InterviewPrepWithSubScores;
  readiness: string;
  strengths: string[];
  weaknesses: string[];
  aiRec: string;
}

/**
 * From `xl` up, results render in the centre column of the session layout,
 * between the session sidebar and the coach panel, so the usable width is
 * roughly `viewport - 884px` -- under 400px at 1280 and 560px at 1536, i.e.
 * narrower than at `lg` where the flanking columns are hidden. Column counts
 * here therefore step back down at `xl` instead of climbing, and the
 * fixed-size pieces (score ring, display type) scale with the column rather
 * than overflowing it.
 */
export function ResultsDashboard({ prep, readiness, strengths, weaknesses, aiRec }: ResultsDashboardProps) {
  return (
    <div className="space-y-8 animate-enter pb-16">
      <div className="text-center space-y-3 mb-10 pt-4">
        <div className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary to-primary shadow-lg shadow-primary/20 mb-2 border border-white/10">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
        </div>
        <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold font-display tracking-tight text-foreground text-balance drop-shadow-sm">Assessment Complete</h2>
        <p className="text-sm sm:text-base text-muted-foreground font-medium text-balance">Comprehensive evaluation and personalized feedback</p>
      </div>

      <div className="space-y-6">
        <div className="min-w-0 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6 z-10">Overall Score</h3>
          <div className="relative flex h-40 w-40 sm:h-44 sm:w-44 max-w-full items-center justify-center mb-6 z-10">
            <svg className="h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
              <circle className="text-muted/50 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent" />
              <motion.circle
                className="text-primary stroke-current"
                strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="44" fill="transparent"
                initial={{ strokeDasharray: "276.46", strokeDashoffset: "276.46" }}
                animate={{ strokeDashoffset: 276.46 - (276.46 * (prep.overallScore ?? 0)) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter">{prep.overallScore}<span className="text-2xl text-muted-foreground">%</span></span>
            </div>
          </div>
          <p className="w-full max-w-full text-xl sm:text-2xl 2xl:text-3xl font-bold text-foreground leading-tight tracking-tight text-balance break-words z-10">{readiness}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <ScoreBreakdown title="MCQ Accuracy" score={prep.mcqScore ?? 0} icon={CheckCircle2} color="primary" />
          <ScoreBreakdown title="Theory Depth" score={prep.theoryScore ?? 0} icon={BookOpen} color="success" />
          <ScoreBreakdown title="Code Quality" score={prep.codingQuestions?.reduce((s: number, q: CodingQuestion) => s + (q.score || 0), 0) / (prep.codingQuestions?.length || 1) * 10} icon={Code2} color="primary" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-success/20 bg-success/5 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-success dark:text-success mb-5"><Zap className="h-4 w-4 shrink-0" /> Demonstrated Strengths</h3>
          <ul className="space-y-4">
            {strengths.length > 0 ? strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed break-words">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
        <div className="min-w-0 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-destructive mb-5"><AlertTriangle className="h-4 w-4 shrink-0" /> Areas for Improvement</h3>
          <ul className="space-y-4">
            {weaknesses.length > 0 ? weaknesses.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed break-words">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6 sm:p-8 shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <h3 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-foreground mb-5"><Brain className="h-6 w-6 text-primary shrink-0" /> Comprehensive Evaluation</h3>
        <p className="text-[15px] text-muted-foreground font-medium leading-relaxed mb-8 max-w-4xl break-words">{aiRec}</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-2 pt-6 border-t border-border/30">
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Communication</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed break-words">{prep.communicationFeedback || 'Not evaluated.'}</p>
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Technical Depth</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed break-words">{prep.technicalFeedback || 'Not evaluated.'}</p>
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Problem Solving</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed break-words">{prep.problemSolvingFeedback || 'Not evaluated.'}</p>
          </div>
        </div>
      </div>

      {prep.nextSteps && prep.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-border/30 bg-card/50 p-6 sm:p-8 shadow-sm">
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-foreground mb-5">Recommended Next Steps</h4>
          <ul className="space-y-3 text-[14px] font-medium text-muted-foreground list-disc pl-5">
            {prep.nextSteps.map((step: string, i: number) => <li key={i} className="pl-2 break-words">{step}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
