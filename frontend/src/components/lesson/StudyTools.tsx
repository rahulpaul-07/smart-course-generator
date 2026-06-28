import React, { useState } from 'react';
import { Bookmark, Check, FlaskConical, Layers3, Loader2, MessageCircle, NotebookPen, Play, Save, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import FlashcardDeck from './FlashcardDeck';
import PracticeLab from './PracticeLab';
import LessonPDFExporter from './LessonPDFExporter';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

function ToolCard({
  active = false,
  description,
  disabled = false,
  icon: Icon,
  onClick,
  status,
  title,
}: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
        active
          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
          : 'border-border/30 bg-card hover:bg-accent/50 hover:border-border/30 hover:shadow-sm'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-start gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-muted text-muted-foreground group-hover:text-foreground group-hover:border-border'
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

const StudyTools = React.memo(({
  addingVideos,
  chatOpen,
  courseId,
  lesson,
  lessonId,
  onAddVideos,
  onLessonUpdate,
  onToggleChat,
}: any) => {
  const [activeTool, setActiveTool] = useState('');
  const [notes, setNotes] = useState(lesson.notes || '');
  const [saving, setSaving] = useState(false);
  const videoCount = lesson.videos?.length || 0;

  async function updateProgress(changes: any, successMessage?: string) {
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

  function toggleTool(tool: string) {
    setActiveTool((current) => current === tool ? '' : tool);
  }

  return (
    <aside className="h-full flex flex-col py-8 px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold text-primary mb-1">Study Toolkit</p>
        <h2 className="text-xl font-semibold text-foreground">Lesson Tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive tools to master this topic.
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 pb-20 lg:pb-0 scrollbar-none">
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
          active={activeTool === 'flashcards'}
          onClick={() => toggleTool('flashcards')}
        />
        <AnimatePresence>
          {activeTool === 'flashcards' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-border bg-card/50 p-4 mb-2 shadow-inner">
                <FlashcardDeck lessonId={lesson._id} courseId={lesson.course} embedded />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ToolCard
          icon={FlaskConical}
          title="Practice Lab"
          description="Apply your knowledge with a hands-on coding lab or exercise."
          active={activeTool === 'lab'}
          onClick={() => toggleTool('lab')}
        />
        <AnimatePresence>
          {activeTool === 'lab' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-border bg-card/50 p-4 mb-2 shadow-inner">
                <PracticeLab lessonId={lesson._id} courseId={lesson.course} embedded />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ToolCard
          icon={NotebookPen}
          title="My Notes"
          description="Save private notes, formulas, or takeaways."
          status={lesson.notes ? 'Saved' : ''}
          active={activeTool === 'notes'}
          onClick={() => toggleTool('notes')}
        />
        <AnimatePresence>
          {activeTool === 'notes' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-border bg-card/50 p-4 mb-2 shadow-inner flex flex-col gap-3">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={12000}
                  rows={6}
                  placeholder="Capture thoughts here..."
                  className="w-full resize-y"
                />
                <Button
                  variant="default"
                  size="lg"
                  disabled={saving}
                  onClick={() => updateProgress({ notes }, 'Notes saved')}
                  className="w-full"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ToolCard
          icon={Play}
          title="Add Videos"
          description="Enrich this lesson with curated YouTube content."
          status={addingVideos ? 'Finding...' : videoCount ? `${videoCount} added` : ''}
          disabled={addingVideos}
          onClick={onAddVideos}
        />
      </div>

      <div className="mt-auto pt-6 border-t border-border/30 flex flex-col gap-3 shrink-0 hidden lg:flex">
        <button
          type="button"
          disabled={saving}
          onClick={() => updateProgress(
            { bookmarked: !lesson.bookmarked },
            lesson.bookmarked ? 'Bookmark removed' : 'Lesson bookmarked',
          )}
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-medium transition-colors border ${lesson.bookmarked ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-foreground hover:bg-muted'}`}
        >
          {lesson.bookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {lesson.bookmarked ? 'Bookmarked' : 'Bookmark Lesson'}
        </button>
        <div className="w-full flex justify-center">
          <LessonPDFExporter lesson={lesson} />
        </div>
      </div>
    </aside>
  );
});

export default StudyTools;
