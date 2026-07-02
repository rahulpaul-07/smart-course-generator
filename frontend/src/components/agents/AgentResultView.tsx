import React from 'react';
import { Bot, CheckCircle2, Target, Lightbulb, ArrowRight, Map, Star } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

export interface CourseReviewerResult {
  rating?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestedImprovements?: string[];
}

export interface LearningCoachResult {
  greeting?: string;
  analysis?: string;
  actionableAdvice?: string[];
  encouragement?: string;
}

export interface RevisionPlanScheduleItem {
  day?: string;
  topic?: string;
  method?: string;
}

export interface RevisionPlannerResult {
  planName?: string;
  schedule?: RevisionPlanScheduleItem[];
}

export interface RecommendationItem {
  topic?: string;
  reason?: string;
}

export interface RecommendationAgentResult {
  recommendations?: RecommendationItem[];
}

export interface AgentErrorResult {
  error: string;
}

export type AgentResult =
  | CourseReviewerResult
  | LearningCoachResult
  | RevisionPlannerResult
  | RecommendationAgentResult
  | AgentErrorResult
  | Record<string, unknown>;

interface AgentResultViewProps {
  activeTab: string;
  result: AgentResult | null;
  onRun?: () => void;
}

export function AgentResultView({ activeTab, result, onRun }: AgentResultViewProps) {
  if (!result) return (
    <div className="py-12">
      <EmptyState
        icon={Bot}
        title="Ready for Analysis"
        description="Configure the agent above and click Run to see AI insights."
        action={
          <button 
            onClick={onRun}
            className="h-10 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Run Agent
          </button>
        }
      />
    </div>
  );

  if (activeTab === 'reviewer') {
    const reviewerResult = result as CourseReviewerResult;
    return (
      <div className="space-y-6 animate-enter">
        <div className="flex items-center gap-4 border-b border-border/30 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg text-2xl font-bold bg-foreground text-background">
            {reviewerResult.rating}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Course Rating</h3>
            <p className="text-sm text-muted-foreground">Overall AI Assessment Score</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5">
            <h4 className="mb-3 font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {reviewerResult.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-emerald-100 flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
            <h4 className="mb-3 font-bold text-red-400 flex items-center gap-2">
              <Target className="h-4 w-4" /> Weaknesses
            </h4>
            <ul className="space-y-2">
              {reviewerResult.weaknesses?.map((w: string, i: number) => (
                <li key={i} className="text-sm text-red-100 flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5">
          <h4 className="mb-3 font-bold text-blue-400 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Suggested Improvements
          </h4>
          <ul className="space-y-2">
            {reviewerResult.suggestedImprovements?.map((s: string, i: number) => (
              <li key={i} className="text-sm text-blue-100 flex items-start gap-2">
                <ArrowRight className="h-4 w-4 shrink-0 text-blue-400" /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (activeTab === 'coach') {
    const coachResult = result as LearningCoachResult;
    return (
      <div className="space-y-6 animate-enter">
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-6 text-center">
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">{coachResult.greeting}</h3>
          <p className="text-brand-200">{coachResult.encouragement}</p>
        </div>
        
        <div className="rounded-xl bg-card/50 border border-border/30 p-5">
          <h4 className="font-bold text-foreground mb-2">AI Analysis</h4>
          <p className="text-sm text-foreground/90">{coachResult.analysis}</p>
        </div>

        <div className="rounded-xl bg-card/50 border border-border/30 p-5">
          <h4 className="font-bold text-foreground mb-4">Actionable Advice</h4>
          <ul className="space-y-3">
            {coachResult.actionableAdvice?.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-3 rounded-lg bg-foreground/10 p-3 text-sm text-foreground">
                <Target className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (activeTab === 'planner') {
    const plannerResult = result as RevisionPlannerResult;
    return (
      <div className="space-y-6 animate-enter">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-5 w-5 text-indigo-400" /> {plannerResult.planName || "Revision Plan"}
        </h3>
        <div className="space-y-3">
          {plannerResult.schedule?.map((item: RevisionPlanScheduleItem, i: number) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border/30 bg-card/50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 font-bold text-indigo-400">
                  {item.day?.substring(0,3)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{item.topic}</p>
                  <p className="text-xs text-muted-foreground">{item.day}</p>
                </div>
              </div>
              <div className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/90">
                {item.method}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'recommend') {
    const recommendResult = result as RecommendationAgentResult;
    return (
      <div className="space-y-4 animate-enter">
        <h3 className="text-xl font-bold text-foreground mb-6">Recommended For You</h3>
        {recommendResult.recommendations?.map((rec: RecommendationItem, i: number) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border/30 bg-card/50 p-5 transition hover:bg-card">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-lg">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-lg">{rec.topic}</h4>
              <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>;
}
