import { ArrowLeft, Bookmark, CheckCircle2, ChevronDown, ChevronRight, List as ListIcon, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';

export default function LessonSidebar({ course, currentLessonId, lessonContent, onBack, onSelectLesson }: { course: any, currentLessonId: string, lessonContent?: any[], onBack: () => void, onSelectLesson: (id: string) => void }) {
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  // Extract headings for TOC
  const headings = lessonContent?.filter(b => b.type === 'heading').map(h => ({
    id: h.text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    text: h.text,
    level: h.level
  })) || [];

  // Track active heading on scroll
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveHeadingId(entry.target.id);
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  return (
    <aside className="hidden h-full w-[280px] xl:w-[320px] flex-shrink-0 overflow-y-auto bg-card lg:flex flex-col border-r border-border/30">
      <header className="sticky top-0 z-10 bg-card p-5 border-b border-border/30">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </button>
        <h2 className="line-clamp-2 text-lg font-semibold text-foreground leading-tight">{course.title}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Table of Contents Section */}
        {headings.length > 0 && (
          <div className="mb-6">
            <button 
              onClick={() => setTocCollapsed(!tocCollapsed)}
              className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground mb-3 px-2 focus-visible:outline-none"
            >
              <span className="flex items-center gap-2">
                <ListIcon className="h-3.5 w-3.5" /> Table of Contents
              </span>
              {tocCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            
            {!tocCollapsed && (
              <div className="relative pl-1 before:absolute before:inset-y-1 before:left-2.5 before:w-px before:bg-border/60">
                {headings.map((h, i) => {
                  const isActive = activeHeadingId === h.id || (!activeHeadingId && i === 0);
                  return (
                    <button
                      key={i}
                      onClick={() => scrollToHeading(h.id)}
                      className={`relative w-full text-left flex items-start py-1.5 pl-6 pr-2 text-sm transition-colors duration-200 focus-visible:outline-none ${
                        isActive 
                          ? 'text-primary font-medium before:absolute before:left-[9px] before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary' 
                          : 'text-muted-foreground/80 hover:text-foreground font-medium'
                      } ${h.level === 3 ? 'pl-8 text-[13px] opacity-80' : ''}`}
                    >
                      <span className="line-clamp-2 leading-tight">{h.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <hr className="border-border/30" />

        {/* Course Navigation Section */}
        <div>
          <button 
            onClick={() => setNavCollapsed(!navCollapsed)}
            className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground mb-3 px-2 focus-visible:outline-none"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Course Curriculum
            </span>
            {navCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {!navCollapsed && course?.modules?.map((moduleDoc: any, moduleIndex: number) => (
            <section key={moduleDoc._id} className="mb-6">
              <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground/70">
                Module {moduleIndex + 1}
              </h3>
              <div className="space-y-1">
                {moduleDoc.lessons?.map((lesson: any) => {
                  const isActive = lesson._id === currentLessonId;
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => onSelectLesson(lesson._id)}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground font-medium'
                      }`}
                    >
                      <div className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border ${
                        lesson.completedAt 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : isActive 
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'bg-background border-border text-muted-foreground/50'
                      }`}>
                        {lesson.completedAt ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="line-clamp-2 leading-tight">{lesson.title}</span>
                        {lesson.bookmarked && <Bookmark className="h-3 w-3 text-primary shrink-0 fill-primary/20" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
