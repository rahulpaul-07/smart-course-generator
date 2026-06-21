import {
  Bookmark,
  Brain,
  Check,
  FlaskConical,
  Layers3,
  Loader2,
  MessageCircle,
  NotebookPen,
  Play,
  Printer,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import FlashcardDeck from './FlashcardDeck';
import PracticeLab from './PracticeLab';
import QuizPanel from './QuizPanel';
import LessonPDFExporter from './LessonPDFExporter';

function ToolCard({
  active = false,
  description,
  disabled = false,
  icon: Icon,
  onClick,
  status,
  title,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex min-h-40 flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? 'border-brand-400/45 bg-gradient-to-br from-brand-500/20 to-cyan-400/[0.05] shadow-lg shadow-brand-950/20'
          : 'border-white/[0.075] bg-white/[0.025] hover:-translate-y-1 hover:border-brand-400/25 hover:bg-brand-500/[0.07]'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
        active
          ? 'border-brand-300/30 bg-brand-500 text-white shadow-lg shadow-brand-500/25'
          : 'border-white/[0.08] bg-white/[0.04] text-slate-300 group-hover:border-brand-400/20 group-hover:bg-brand-500/10 group-hover:text-brand-200'
      }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="mt-4 flex w-full items-center justify-between gap-2">
        <span className="font-medium text-white">{title}</span>
        {status && <span className="text-xs text-brand-300">{status}</span>}
      </span>
      <span className="mt-1 text-xs leading-relaxed text-slate-500">{description}</span>
    </button>
  );
}

export default function StudyTools({
  addingVideos,
  chatOpen,
  lesson,
  onAddVideos,
  onLessonUpdate,
  onToggleChat,
}) {
  const [activeTool, setActiveTool] = useState('');
  const [notes, setNotes] = useState(lesson.notes || '');
  const [saving, setSaving] = useState(false);
  const videoCount = lesson.content?.filter((block) => block.type === 'video').length || 0;

  async function updateProgress(changes, successMessage) {
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

  function toggleTool(tool) {
    setActiveTool((current) => current === tool ? '' : tool);
  }

  return (
    <section className="surface-card mt-14 overflow-hidden">
      <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-r from-brand-500/10 via-transparent to-cyan-400/[0.04] px-5 py-7 sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-500/15 blur-3xl" />
        <p className="eyebrow">Keep learning</p>
        <h2 className="relative mt-2 font-display text-2xl font-bold text-white">Your lesson toolkit</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Review the ideas, test your understanding, or get help without leaving this lesson.
        </p>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            icon={Play}
            title="Add videos"
            description="Find helpful videos and add them to the lesson."
            status={addingVideos ? 'Finding...' : videoCount ? `${videoCount} added` : ''}
            disabled={addingVideos}
            onClick={onAddVideos}
          />
          <ToolCard
            icon={Layers3}
            title="Flashcards"
            description="Turn key concepts into a quick review deck."
            active={activeTool === 'flashcards'}
            onClick={() => toggleTool('flashcards')}
          />
          <ToolCard
            icon={Brain}
            title="Quick quiz"
            description="Check your understanding with five questions."
            status={lesson.quizBestScore > 0 ? `Best ${lesson.quizBestScore}/5` : ''}
            active={activeTool === 'quiz'}
            onClick={() => toggleTool('quiz')}
          />
          <ToolCard
            icon={MessageCircle}
            title="Ask AI"
            description="Ask follow-up questions about this lesson."
            status={chatOpen ? 'Open' : ''}
            active={chatOpen}
            onClick={onToggleChat}
          />
          <ToolCard
            icon={NotebookPen}
            title="My notes"
            description="Capture examples, questions, and takeaways."
            status={lesson.notes ? 'Saved' : ''}
            active={activeTool === 'notes'}
            onClick={() => toggleTool('notes')}
          />
          <ToolCard
            icon={FlaskConical}
            title="Practice lab"
            description="Apply the lesson in a realistic mini project."
            active={activeTool === 'lab'}
            onClick={() => toggleTool('lab')}
          />
        </div>

        {activeTool && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/15 p-4 animate-scale-in sm:p-6">
            {activeTool === 'notes' && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-white">Private lesson notes</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      These notes stay private and are never included in shared course links.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateProgress({ notes }, 'Notes saved')}
                    className="btn-primary"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save notes'}
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={12000}
                  rows={8}
                  placeholder="Capture questions, examples, and your own explanation..."
                  className="input-field mt-4 resize-y"
                />
              </>
            )}
            {activeTool === 'flashcards' && <FlashcardDeck lessonId={lesson._id} embedded />}
            {activeTool === 'quiz' && (
              <QuizPanel lesson={lesson} onLessonUpdate={onLessonUpdate} embedded />
            )}
            {activeTool === 'lab' && <PracticeLab lessonId={lesson._id} embedded />}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
          <p className="text-xs text-slate-500">Useful lesson actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => updateProgress(
                { bookmarked: !lesson.bookmarked },
                lesson.bookmarked ? 'Bookmark removed' : 'Lesson bookmarked',
              )}
              className={lesson.bookmarked ? 'btn-primary' : 'btn-secondary'}
            >
              {lesson.bookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {lesson.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <LessonPDFExporter lesson={lesson} />
          </div>
        </div>
      </div>
    </section>
  );
}
