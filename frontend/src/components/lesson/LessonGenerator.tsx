import { BookOpen, Languages, Loader2, Sparkles } from 'lucide-react';

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
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10 text-brand-200">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">AI lesson studio</p>
            <h2 className="mt-1 font-display text-lg font-bold text-foreground">
              {hasContent ? 'Shape this lesson your way' : 'Bring this lesson to life'}
            </h2>
          </div>
        </div>
        {!isPickerOpen && (
          <button
            type="button"
            onClick={() => onPickerChange(true)}
            disabled={isGenerating}
            className="btn-primary"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating
              ? isStreaming ? 'Streaming...' : 'Generating...'
              : hasContent ? 'Regenerate' : 'Generate lesson'}
          </button>
        )}
      </div>
      <p className="relative mt-4 text-sm text-muted-foreground">
        {isStreaming
          ? `Streaming content... ${streamedCount} block${streamedCount !== 1 ? 's' : ''} received`
          : isGenerating
            ? 'Connecting to AI and starting generation...'
            : 'Choose the lesson depth and language.'}
      </p>

      {isGenerating && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-brand-300 mb-2 px-1">
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
        <div className="relative mt-5 grid gap-4 rounded-2xl border border-border bg-black/10 p-4 sm:grid-cols-2">
          <label className="text-sm text-foreground/90">
            <span className="flex items-center gap-2 font-medium"><BookOpen className="h-4 w-4 text-brand-300" /> Learning depth</span>
            <select
              value={selectedDepth}
              onChange={(event) => onDepthChange(event.target.value)}
              className="input-field mt-2"
            >
              <option value="brief" className="bg-background text-foreground">Brief</option>
              <option value="standard" className="bg-background text-foreground">Standard</option>
              <option value="deep" className="bg-background text-foreground">Deep</option>
            </select>
          </label>

          <label className="text-sm text-foreground/90">
            <span className="flex items-center gap-2 font-medium"><Languages className="h-4 w-4 text-cyan-300" /> Language</span>
            <input
              type="text"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="input-field mt-2"
              maxLength={80}
              required
            />
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button type="button" onClick={() => onPickerChange(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onGenerate} disabled={isGenerating} className="btn-primary">
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
