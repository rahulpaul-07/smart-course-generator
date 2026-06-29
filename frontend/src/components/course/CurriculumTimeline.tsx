import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Lock, PlayCircle, Bookmark, Layers3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { calculatePercentage } from '../../utils/percentages';

const ModuleCard = ({ moduleDoc, moduleIndex, courseId }: { moduleDoc: any, moduleIndex: number, courseId: string }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(moduleIndex === 0);
  
  const totalLessons = moduleDoc.lessons?.length || 0;
  const completedLessons = moduleDoc.lessons?.filter((l: any) => l.completedAt)?.length || 0;
  const progress = calculatePercentage(completedLessons, totalLessons);
  const isCompleted = progress === 100;

  // Determine current lesson index (first uncompleted lesson)
  const currentLessonIndex = moduleDoc.lessons?.findIndex((l: any) => !l.completedAt);
  const activeLessonIdx = currentLessonIndex === -1 ? totalLessons - 1 : currentLessonIndex;

  return (
    <Card className="overflow-hidden border border-border/30 bg-card shadow-sm hover:shadow-md hover:border-border/30 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:bg-muted/50"
      >
        <div className="flex items-center gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-inner ${isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : String(moduleIndex + 1).padStart(2, '0')}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground">Module {moduleIndex + 1}</span>
            </div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{moduleDoc.title}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-foreground">{completedLessons} / {totalLessons} Lessons</div>
            <div className="text-xs text-muted-foreground">{progress}% Complete</div>
          </div>
          
          <div className="flex-1 sm:hidden">
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <div className="shrink-0 h-8 w-8 rounded-full bg-background/80 border border-border/30 flex items-center justify-center text-muted-foreground shadow-sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-5 sm:px-6 pb-6 pt-2">
              <div className="relative pl-4 border-l-2 border-border/30 ml-4 space-y-4 py-2">
                {moduleDoc.lessons?.map((lesson: any, lessonIndex: number) => {
                  const isLessonCompleted = !!lesson.completedAt;
                  const isCurrent = lessonIndex === activeLessonIdx;
                  const isLocked = lessonIndex > activeLessonIdx;

                  let nodeColor = 'bg-muted-foreground border-background';
                  let textColor = 'text-muted-foreground';
                  let icon = <Lock className="h-3 w-3" />;
                  
                  if (isLessonCompleted) {
                    nodeColor = 'bg-emerald-500 border-background';
                    textColor = 'text-foreground';
                    icon = <CheckCircle2 className="h-3.5 w-3.5 text-white" />;
                  } else if (isCurrent) {
                    nodeColor = 'bg-primary border-primary/30 ring-4 ring-primary/10';
                    textColor = 'text-foreground font-semibold';
                    icon = <PlayCircle className="h-3 w-3 text-white fill-white/20" />;
                  }

                  return (
                    <button
                      key={lesson._id}
                      disabled={isLocked}
                      onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}`)}
                      className={`relative w-full flex items-start sm:items-center gap-4 text-left group/lesson focus-visible:outline-none ${isLocked ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 transition-transform'}`}
                    >
                      <div className={`absolute -left-[27px] sm:-left-[27px] top-1 sm:top-1/2 sm:-translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors shadow-sm ${nodeColor}`}>
                        {icon}
                      </div>
                      
                      <Card className={`flex-1 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border transition-colors ${isCurrent ? 'bg-card border-primary/30 shadow-primary/5' : 'bg-card border-border/30 hover:shadow-md hover:border-border/30'}`}>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={`text-sm truncate ${textColor} ${!isLocked && 'group-hover/lesson:text-primary transition-colors'}`}>
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 opacity-70">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> ~15m
                            </span>
                          </div>
                        </div>

                        {!isLocked && (
                          <div className="flex items-center gap-3 shrink-0">
                            {lesson.bookmarked && <Bookmark className="h-4 w-4 text-primary fill-primary/20" />}
                            {lesson.quizBestScore > 0 && (
                              <span className="text-xs font-semibold text-foreground bg-foreground/10 px-2 py-0.5 rounded-full border border-border/30">
                                {lesson.quizBestScore}/5 Score
                              </span>
                            )}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border shadow-sm transition-colors ${isLessonCompleted ? 'bg-background border-border/30 text-emerald-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                              <PlayCircle className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export function CurriculumTimeline({ course, courseId }: { course: any, courseId: string | undefined }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-primary" /> Curriculum
        </h2>
      </div>
      <div className="space-y-4">
        {course?.modules?.map((moduleDoc: any, moduleIndex: number) => (
          <ModuleCard key={moduleDoc._id} moduleDoc={moduleDoc} moduleIndex={moduleIndex} courseId={courseId || ''} />
        ))}
      </div>
    </motion.section>
  );
}
