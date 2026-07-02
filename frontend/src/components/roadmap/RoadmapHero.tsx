import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Roadmap } from '../../types';

interface RoadmapHeroProps {
  activeRoadmap: Roadmap;
  setActiveRoadmap: (value: Roadmap | null | ((val: Roadmap | null) => Roadmap | null)) => void;
  deleteRoadmap: (id: string) => void;
  generateCourseFromTopic: (topic: string) => Promise<void>;
}

export function RoadmapHero({ activeRoadmap, setActiveRoadmap, deleteRoadmap, generateCourseFromTopic }: RoadmapHeroProps) {
  const [startingCourse, setStartingCourse] = useState(false);

  async function handleContinueLearning() {
    setStartingCourse(true);
    await generateCourseFromTopic(activeRoadmap.goal);
    setStartingCourse(false);
  }
  return (
    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <button onClick={() => setActiveRoadmap(null)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="px-3 py-1 rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          {activeRoadmap.skillLevel}
        </span>
        <span className="px-3 py-1 rounded-lg border border-border bg-background/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {activeRoadmap.duration}
        </span>
      </div>
      
      <h2 className="font-serif text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1] relative z-10">
        {activeRoadmap.goal}
      </h2>
      
      {activeRoadmap.summary && (
        <p className="text-[16px] text-muted-foreground font-medium leading-relaxed max-w-3xl relative z-10">
          {activeRoadmap.summary}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3 relative z-10">
        <button
          onClick={handleContinueLearning}
          disabled={startingCourse}
          className="h-11 bg-foreground text-background px-6 rounded-xl font-bold hover:bg-foreground/90 transition-all shadow-md text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {startingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {startingCourse ? 'Generating Course…' : 'Start a Course for This Goal'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); deleteRoadmap(activeRoadmap._id); }} className="h-11 border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-6 rounded-xl font-bold transition-all text-sm">
          Delete Roadmap
        </button>
      </div>
    </div>
  );
}
