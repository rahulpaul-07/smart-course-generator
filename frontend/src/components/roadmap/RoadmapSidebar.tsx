import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface RoadmapSidebarProps {
  roadmaps: any[];
  viewRoadmap: (id: string) => void;
  deleteRoadmap: (id: string) => void;
}

export function RoadmapSidebar({ roadmaps, viewRoadmap, deleteRoadmap }: RoadmapSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Your Blueprints</h3>
      <div className="space-y-3">
        {roadmaps.map((r) => (
          <button
            type="button"
            key={r._id}
            className="group cursor-pointer rounded-2xl border border-border/30 bg-card/30 p-4 transition-all hover:bg-card hover:border-primary/40 hover:shadow-lg flex flex-col justify-between min-h-[120px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 w-full"
            onClick={() => viewRoadmap(r._id)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-bold text-foreground leading-snug line-clamp-2">{r.goal}</p>
              <button
                onClick={(e) => { e.stopPropagation(); deleteRoadmap(r._id); }}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.duration}</span>
              <span className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.skillLevel}</span>
            </div>
          </button>
        ))}
        {roadmaps.length === 0 && (
          <EmptyState
            icon={Layers}
            title="No blueprints yet"
            description="Create your first roadmap."
            className="min-h-[160px] p-6 bg-card/10 border-border/30"
          />
        )}
      </div>
    </div>
  );
}
