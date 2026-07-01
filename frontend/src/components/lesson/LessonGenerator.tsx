import { BookOpen, Languages, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

interface LessonGeneratorProps {
  hasContent: boolean;
  isGenerating: boolean;
  isPickerOpen: boolean;
  language: string;
  onGenerate: () => void;
  onLanguageChange: (language: string) => void;
  onPickerChange: (open: boolean) => void;
  onDepthChange: (depth: string) => void;
  selectedDepth: string;
  streamedCount?: number;
  streamStage?: string;
}

export default function LessonGenerator({
  hasContent,
  isGenerating,
  isPickerOpen,
  language,
  onGenerate,
  onLanguageChange,
  onPickerChange,
  onDepthChange,
  selectedDepth,
  streamedCount = 0,
  streamStage = 'Creating outline',
}: LessonGeneratorProps) {
  const isStreaming = isGenerating && streamedCount > 0;

  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl bg-card border border-border/50 p-5 shadow-lg animate-enter-delay sm:p-6 group">
      {/* Animated gradient border overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(110deg,transparent,rgba(var(--primary),0.1),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-[50px] transition-all group-hover:bg-primary/20 group-hover:scale-110" />
      
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 items-start">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.15)] relative">
            <Sparkles className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">AI Lesson Studio</p>
            <h2 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {hasContent ? 'Shape this lesson your way' : 'Bring this lesson to life'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isStreaming
                ? `Streaming content... ${streamedCount} block${streamedCount !== 1 ? 's' : ''} received`
                : isGenerating
                  ? 'Connecting to AI and starting generation...'
                  : 'Choose the lesson depth and language to generate.'}
            </p>
          </div>
        </div>
        {!isPickerOpen && (
          <Button
            type="button"
            size="lg"
            onClick={() => onPickerChange(true)}
            disabled={isGenerating}
            className={`shrink-0 rounded-full px-6 shadow-[0_4px_15px_rgba(var(--primary),0.2)] hover:shadow-[0_4px_25px_rgba(var(--primary),0.4)] transition-all hover:-translate-y-1 ${isGenerating ? 'cursor-progress opacity-90' : 'bg-gradient-to-r from-primary to-indigo-500 text-white border-0'}`}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isGenerating
              ? isStreaming ? 'Streaming...' : 'Generating...'
              : hasContent ? 'Regenerate' : 'Generate Lesson'}
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-medium text-brand-300 mb-3 px-1">
            <span className="flex items-center gap-1.5">
              {streamStage === 'Creating outline' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              Creating outline
            </span>
            <span className="text-muted-foreground hidden sm:inline">&rarr;</span>
            <span className={`flex items-center gap-1.5 ${streamedCount >= 1 ? 'text-brand-300' : 'text-muted-foreground'}`}>
              {streamStage === 'Writing section' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (streamedCount >= 1 ? <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5" />)}
              Writing section
            </span>
            <span className="text-muted-foreground hidden sm:inline">&rarr;</span>
            <span className={`flex items-center gap-1.5 ${streamedCount >= 3 ? 'text-brand-300' : 'text-muted-foreground'}`}>
              {streamStage === 'Generating code examples' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (streamedCount >= 3 ? <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5" />)}
              Code examples
            </span>
            <span className="text-muted-foreground hidden sm:inline">&rarr;</span>
            <span className={`flex items-center gap-1.5 ${streamedCount >= 6 ? 'text-brand-300' : 'text-muted-foreground'}`}>
              {streamStage === 'Finalizing lesson' || streamStage === 'Saving lesson' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (streamStage === 'Saving lesson' ? <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5" />)}
              Finalizing
            </span>
          </div>
          <div className="stream-pulse-bar" />
        </div>
      )}

      {isPickerOpen && (
        <div className="relative mt-6 grid gap-5 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-2">
          <label className="text-sm text-foreground/90">
            <span className="flex items-center gap-2 font-medium"><BookOpen className="h-4 w-4 text-brand-400" /> Learning depth</span>
            <select
              value={selectedDepth}
              onChange={(event) => onDepthChange(event.target.value)}
              className="input-field mt-2 bg-background border-border/50"
            >
              <option value="brief" className="bg-background text-foreground">Brief</option>
              <option value="standard" className="bg-background text-foreground">Standard</option>
              <option value="deep" className="bg-background text-foreground">Deep</option>
            </select>
          </label>

          <label className="text-sm text-foreground/90">
            <span className="flex items-center gap-2 font-medium"><Languages className="h-4 w-4 text-cyan-400" /> Language</span>
            <input
              type="text"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="input-field mt-2 bg-background border-border/50"
              maxLength={80}
              required
            />
          </label>

          <div className="flex gap-3 sm:col-span-2 mt-2">
            <Button type="button" size="lg" onClick={() => onPickerChange(false)} variant="outline" className="bg-background">
              Cancel
            </Button>
            <Button type="button" size="lg" onClick={onGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Lesson'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
