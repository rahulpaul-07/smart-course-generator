import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Flag, LayoutGrid, Loader2, Rocket, ArrowRight } from 'lucide-react';
import type { Roadmap, RoadmapWeek } from '../../types';

interface RoadmapWeekCardProps {
  roadmap: Roadmap;
  week: RoadmapWeek;
  index: number;
  isExpanded: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isSaving?: boolean;
  toggleWeek: (num: number) => void;
  toggleCompletion: (e: React.MouseEvent<HTMLButtonElement>, num: number) => void;
  onGenerateCourse: (topic: string) => void;
}

export function RoadmapWeekCard({
  roadmap, week, index, isExpanded, isCompleted, isCurrent, isSaving, toggleWeek, toggleCompletion, onGenerateCourse
}: RoadmapWeekCardProps) {
  const [generatingTopic, setGeneratingTopic] = React.useState<string | null>(null);

  const handleGenerateCourse = async (topic: string) => {
    setGeneratingTopic(topic);
    await onGenerateCourse(topic);
    setGeneratingTopic(null);
  };

  return (
    <div className="relative pl-20">
      
      {/* Timeline Node */}
      <div 
        className={`absolute left-4 top-5 h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors shadow-sm ${
          isCompleted 
            ? 'bg-emerald-500 border-emerald-500 text-background shadow-emerald-500/20' 
            : isCurrent 
              ? 'bg-primary border-primary text-primary-foreground shadow-primary/20 ring-4 ring-primary/10' 
              : 'bg-background border-border text-muted-foreground'
        }`}
      >
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[12px] font-bold">{week.weekNumber}</span>}
      </div>

      {/* Expandable Card */}
      <div className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isCurrent 
          ? 'border-primary/40 bg-card/60 shadow-lg shadow-primary/5 ring-1 ring-primary/10' 
          : isCompleted 
            ? 'border-border/30 bg-muted/20 opacity-80' 
            : 'border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50'
      }`}>
        
        <button
          onClick={() => toggleWeek(week.weekNumber)}
          className="w-full flex items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:bg-muted/50"
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-3 mb-1.5">
              <p className={`text-[11px] font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                Week {week.weekNumber}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded border border-border bg-background/50 flex items-center gap-1">
                <LayoutGrid className="h-3 w-3" /> {week.topics?.length || 0} Topics
              </span>
            </div>
            <h3 className={`font-serif text-xl font-bold truncate ${isCompleted ? 'text-foreground/70' : 'text-foreground'}`}>
              {week.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={(e) => toggleCompletion(e, week.weekNumber)}
              disabled={isSaving}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition-colors border shadow-sm flex items-center gap-2 ${
                isCompleted 
                  ? 'bg-background border-border text-muted-foreground hover:bg-muted' 
                  : 'bg-background border-border text-foreground hover:border-primary/50 hover:text-primary'
              } ${isSaving ? 'cursor-progress opacity-70' : ''}`}
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'bg-muted rotate-180' : 'hover:bg-muted'}`}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key={`content-${roadmap._id}-${index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden bg-background/50 border-t border-border/30"
            >
              <div className="p-6 space-y-8">
                
                {/* Topics Section */}
                {(week.topics?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground mb-4">
                      <BookOpen className="h-4 w-4 text-primary" /> Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {week.topics?.map((topic: string, i: number) => {
                        const isGenerating = generatingTopic === topic;
                        return (
                          <button
                            key={i}
                            disabled={isGenerating}
                            onClick={() => handleGenerateCourse(topic)}
                            className={`group flex items-center gap-2 rounded-xl border border-border/30 bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isGenerating ? 'cursor-progress opacity-70' : ''}`}
                            title={`Generate a course on "${topic}"`}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                            )}
                            {topic}
                            {!isGenerating && <ChevronRight className="h-3 w-3 opacity-0 -ml-1 text-primary group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Milestones */}
                  {(week.milestones?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
                        <Flag className="h-4 w-4" /> Milestones
                      </h4>
                      <ul className="space-y-3">
                        {week.milestones?.map((m: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Project */}
                  {week.project?.title && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm flex flex-col h-full">
                      <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3">
                        <Rocket className="h-4 w-4" /> Weekly Project
                      </h4>
                      <p className="text-[15px] font-bold text-foreground mb-2">{week.project.title}</p>
                      {week.project.description && (
                        <p className="text-[14px] leading-relaxed text-muted-foreground font-medium mb-5 flex-1">
                          {week.project.description}
                        </p>
                      )}
                      <button
                        disabled={generatingTopic === week.project.title}
                        onClick={() => handleGenerateCourse(week.project?.title ?? '')}
                        className={`mt-auto flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-background border border-amber-500/30 text-[13px] font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${generatingTopic === week.project.title ? 'cursor-progress opacity-70' : ''}`}
                      >
                        {generatingTopic === week.project.title ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing...</>
                        ) : (
                          <>Build Project <ArrowRight className="h-3.5 w-3.5" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
