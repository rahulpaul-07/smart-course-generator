import React, { Suspense, lazy } from 'react';
import { Sparkles, LayoutTemplate, CheckCircle2, BookOpen } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import LessonGenerator from './LessonGenerator';
import LessonCompletion from './LessonCompletion';
import VideoBlock from '../blocks/VideoBlock';
const LessonRenderer = lazy(() => import('./LessonRenderer'));

interface LessonContentProps {
  lesson: any;
  course: any;
  courseId: string | undefined;
  isFocusMode: boolean;
  hasContent: boolean;
  generating: boolean;
  showDepthPicker: boolean;
  selectedLanguage: string;
  selectedDepth: string;
  streamStatus: string;
  streamError: string;
  streamedCount: number;
  streamStage: string;
  onGenerate: () => void;
  onLanguageChange: (lang: string) => void;
  onPickerChange: (show: boolean) => void;
  onDepthChange: (depth: string) => void;
  updateCurrentLesson: (lesson: any) => void;
}

export function LessonContent({
  lesson,
  course,
  courseId,
  isFocusMode,
  hasContent,
  generating,
  showDepthPicker,
  selectedLanguage,
  selectedDepth,
  streamStatus,
  streamError,
  streamedCount,
  streamStage,
  onGenerate,
  onLanguageChange,
  onPickerChange,
  onDepthChange,
  updateCurrentLesson
}: LessonContentProps) {
  return (
    <article data-reading-content className={`mx-auto w-full transition-all duration-300 px-5 py-12 lg:py-16 ${isFocusMode ? 'max-w-[900px]' : 'max-w-[820px] lg:px-12'}`}>
      <header className="mb-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 border-b border-border/30 pb-8">
          {lesson.completedAt && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-500 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
            <LayoutTemplate className="w-3.5 h-3.5" /> {lesson.language || 'English'}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Generated
          </span>
        </div>
      </header>

      <LessonGenerator
        hasContent={hasContent}
        isGenerating={generating}
        isPickerOpen={showDepthPicker}
        language={selectedLanguage}
        onGenerate={onGenerate}
        onLanguageChange={onLanguageChange}
        onPickerChange={onPickerChange}
        onDepthChange={onDepthChange}
        selectedDepth={selectedDepth}
        streamedCount={streamedCount}
        streamStage={streamStage}
      />

      {streamStatus === 'success' && !generating && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl my-8 flex items-center justify-center gap-3 text-emerald-500 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">Lesson generated successfully!</span>
        </div>
      )}

      {streamStatus === 'interrupted' && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-2xl my-8 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-bold text-amber-500 mb-2">Connection Lost</h3>
          <p className="text-muted-foreground font-medium mb-6">The AI stream was disconnected. The backend may have finished saving the lesson.</p>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="bg-background border border-border/30 text-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">Reload Page</button>
            <button onClick={onGenerate} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">Regenerate Lesson</button>
          </div>
        </div>
      )}

      {streamStatus === 'error' && (
        <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-2xl my-8 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-bold text-destructive mb-2">Generation Failed</h3>
          <p className="text-muted-foreground font-medium mb-6">{streamError}</p>
          <button onClick={onGenerate} className="bg-destructive text-destructive-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-destructive/90 transition-all">Try Again</button>
        </div>
      )}

      <Suspense fallback={<div className="py-32 flex flex-col items-center justify-center gap-4"><LoadingSpinner text="Rendering premium content..." /></div>}>
        <div className="mt-8 [&_pre]:!p-6 [&_.my-8]:!my-10 [&_.my-8]:!shadow-sm [&_.my-8]:!border-border/30 [&_.bg-\[\#161b22\]]:!py-3 [&_.bg-\[\#161b22\]]:!px-5 [&_ul]:!pl-6 [&_ul]:!list-disc [&_ul]:!mb-6 [&_ol]:!pl-6 [&_ol]:!list-decimal [&_ol]:!mb-6 [&_li]:!mb-2 [&_blockquote]:!border-l-4 [&_blockquote]:!border-primary/40 [&_blockquote]:!pl-5 [&_blockquote]:!py-1 [&_blockquote]:!italic [&_blockquote]:!text-muted-foreground [&_blockquote]:!bg-muted/10 [&_blockquote]:!rounded-r-lg [&_blockquote]:!mb-6 [&_table]:!w-full [&_table]:!mb-8 [&_table]:!border-collapse [&_table]:!text-sm [&_th]:!bg-muted/30 [&_th]:!p-3 [&_th]:!font-semibold [&_th]:!text-left [&_th]:!border [&_th]:!border-border/30 [&_td]:!p-3 [&_td]:!border [&_td]:!border-border/30">
          <LessonRenderer content={lesson.content} isStreaming={generating} />
        </div>
      </Suspense>

      {lesson.videos && lesson.videos.length > 0 && (
        <div className="mt-20 pt-12 border-t border-border/30">
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-8 flex items-center gap-3">
            Recommended Videos
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {lesson.videos.map((video: any, idx: number) => (
              <VideoBlock key={idx} block={{ type: 'video', url: video.url, title: video.title }} />
            ))}
          </div>
        </div>
      )}

      {!hasContent && !generating && streamStatus !== 'error' && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed border-border/30 bg-card/10 backdrop-blur-sm mt-12 shadow-sm">
          <div className="h-24 w-24 bg-muted border border-border/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
            <BookOpen className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">Ready to Learn?</h3>
          <p className="text-base font-medium text-muted-foreground max-w-sm">Generate this lesson to get a beautifully formatted, personalized AI-crafted educational content.</p>
        </div>
      )}

      {hasContent && !generating && course && (
        <div className="mt-20 pt-12 border-t border-border/30">
          <LessonCompletion course={course} courseId={courseId} lesson={lesson} onLessonUpdate={updateCurrentLesson} />
        </div>
      )}
    </article>
  );
}
