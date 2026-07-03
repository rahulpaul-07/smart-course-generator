import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Bookmark, Brain, Check, FlaskConical, Layers3, Loader2, MessageCircle, NotebookPen, Play, Save, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import FlashcardDeck from './FlashcardDeck';
import PracticeLab from './PracticeLab';
import LessonPDFExporter from './LessonPDFExporter';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { Lesson } from '../../types';
import type { LessonProgressUpdate } from '../../services/lessonService';

interface ToolCardProps {
  active?: boolean;
  description: string;
  disabled?: boolean;
  icon: LucideIcon;
  onClick: () => void;
  status?: string;
  title: string;
}

function ToolCard({
  active = false,
  description,
  disabled = false,
  icon: Icon,
  onClick,
  status,
  title,
}: ToolCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
        active
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)] ring-1 ring-primary/50'
          : 'border-border/50 bg-card hover:bg-accent/40 hover:border-primary/30 hover:shadow-lg'
      } disabled:opacity-60 ${disabled ? 'cursor-progress' : 'cursor-pointer'} hover:-translate-y-0.5`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      <div className="relative flex items-start gap-4 z-10">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
          active
            ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]'
            : 'border-border bg-muted text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:scale-110'
        }`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-semibold text-sm ${active ? 'text-primary' : 'text-foreground'}`}>{title}</span>
            {status && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{status}</span>}
          </div>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</span>
        </div>
      </div>
    </button>
  );
}

interface StudyToolsProps {
  addingVideos: boolean;
  chatOpen: boolean;
  courseId: string;
  lesson: Lesson;
  onAddVideos: () => void;
  onLessonUpdate: (lesson: Lesson) => void;
  onToggleChat: () => void;
}

const INLINE_TOOLS: Record<string, { icon: LucideIcon; title: string }> = {
  flashcards: { icon: Layers3, title: 'Flashcards' },
  lab: { icon: FlaskConical, title: 'Practice Lab' },
  notes: { icon: NotebookPen, title: 'My Notes' },
};

const StudyTools = React.memo(({
  addingVideos,
  chatOpen,
  courseId,
  lesson,
  onAddVideos,
  onLessonUpdate,
  onToggleChat,
}: StudyToolsProps) => {
  const [activeTool, setActiveTool] = useState('');
  const [notes, setNotes] = useState(lesson.notes || '');
  const [saving, setSaving] = useState(false);
  const videoCount = lesson.videos?.length || 0;

  async function updateProgress(changes: LessonProgressUpdate, successMessage?: string) {
    setSaving(true);
    try {
      const { data } = await api.patch(`/courses/lessons/${lesson._id}/progress`, changes);
      onLessonUpdate(data);
      if (successMessage) toast.success(successMessage);
    } catch {
      toast.error('Could not save lesson progress');
    } finally {
      setSaving(false);
    }
  }

  // Focused mode: exactly one tool visible, using the full panel, so nothing
  // stacks and scrolls behind it. Browse mode (activeTool === '') shows the
  // compact list of everything available instead.
  if (activeTool && INLINE_TOOLS[activeTool]) {
    const { icon: Icon, title } = INLINE_TOOLS[activeTool];
    return (
      <aside className="h-full flex flex-col relative overflow-hidden">
        <div className="shrink-0 flex items-center gap-3 px-4 py-4 border-b border-border/30 bg-card">
          <button
            type="button"
            onClick={() => setActiveTool('')}
            aria-label="Back to study tools"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary bg-primary text-primary-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTool === 'flashcards' && (
            <FlashcardDeck
              lessonId={lesson._id}
              courseId={courseId}
              initialFlashcards={lesson.flashcards}
              onFlashcardsUpdate={(flashcards) => onLessonUpdate({ ...lesson, flashcards })}
              embedded
            />
          )}
          {activeTool === 'lab' && (
            <PracticeLab
              lessonId={lesson._id}
              courseId={courseId}
              initialLab={lesson.practiceLab}
              onLabUpdate={(practiceLab) => onLessonUpdate({ ...lesson, practiceLab })}
              embedded
            />
          )}
          {activeTool === 'notes' && (
            <div className="flex flex-col gap-3">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={12000}
                rows={12}
                placeholder="Capture thoughts here..."
                className="w-full resize-y"
              />
              <Button
                variant="default"
                size="lg"
                disabled={saving}
                onClick={() => updateProgress({ notes }, 'Notes saved')}
                className={`w-full ${saving ? 'cursor-progress' : ''}`}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full flex flex-col relative overflow-hidden">
      {/* Premium subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_80%_30%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 px-6 py-8 mb-4 shrink-0">
        <p className="text-xs font-bold tracking-wider uppercase text-primary mb-1">Study Toolkit</p>
        <h2 className="text-2xl font-bold text-foreground font-display">Lesson Tools</h2>
        <p className="mt-1 text-sm text-muted-foreground font-medium">
          Interactive tools to master this topic.
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto px-4 pb-20 lg:pb-4">
        <ToolCard
          icon={MessageCircle}
          title="AI Tutor"
          description="Discuss this lesson, ask questions, or request simpler explanations."
          status={chatOpen ? 'Open' : ''}
          active={chatOpen}
          onClick={onToggleChat}
        />

        <ToolCard
          icon={Layers3}
          title="Flashcards"
          description="Test your memory with an AI-generated deck."
          onClick={() => setActiveTool('flashcards')}
        />

        <ToolCard
          icon={FlaskConical}
          title="Practice Lab"
          description="Apply your knowledge with a hands-on coding lab or exercise."
          onClick={() => setActiveTool('lab')}
        />

        <ToolCard
          icon={NotebookPen}
          title="My Notes"
          description="Save private notes, formulas, or takeaways."
          status={lesson.notes ? 'Saved' : ''}
          onClick={() => setActiveTool('notes')}
        />

        <ToolCard
          icon={Play}
          title="Add Videos"
          description="Enrich this lesson with curated YouTube content."
          status={addingVideos ? 'Finding...' : videoCount ? `${videoCount} added` : ''}
          disabled={addingVideos}
          onClick={onAddVideos}
        />

        <Link
          to="/interview-prep"
          className="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-destructive/30 hover:bg-accent/40 hover:shadow-lg"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:border-destructive/30 group-hover:bg-destructive/10 group-hover:text-destructive">
            <Brain className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">Practice in a Mock Interview</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">Test this topic under real interview conditions.</span>
          </div>
        </Link>

        <div className="pt-3 mt-1 border-t border-border/30 flex-col gap-3 shrink-0 hidden lg:flex">
          <button
            type="button"
            disabled={saving}
            onClick={() => updateProgress(
              { bookmarked: !lesson.bookmarked },
              lesson.bookmarked ? 'Bookmark removed' : 'Lesson bookmarked',
            )}
            className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-medium transition-colors border ${lesson.bookmarked ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-foreground hover:bg-muted'} ${saving ? 'cursor-progress opacity-60' : ''}`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : lesson.bookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {lesson.bookmarked ? 'Bookmarked' : 'Bookmark Lesson'}
          </button>
          <div className="w-full flex justify-center">
            <LessonPDFExporter lesson={lesson} />
          </div>
        </div>
      </div>
    </aside>
  );
});

export default StudyTools;
