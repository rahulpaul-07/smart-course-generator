import { BookOpen, Languages, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

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
}) {
  const isStreaming = isGenerating && streamedCount > 0;

  return (
    <section className="surface-card relative mb-10 overflow-hidden p-5 animate-enter-delay sm:p-6">
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 items-start">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-200">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-300">AI Lesson Studio</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">
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
            className={`shrink-0 rounded-xl shadow-sm ${isGenerating ? 'cursor-progress' : ''}`}
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
