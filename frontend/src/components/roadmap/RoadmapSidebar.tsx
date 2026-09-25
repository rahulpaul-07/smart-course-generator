import { Layers, Trash2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { Roadmap } from '../../types';

interface RoadmapSidebarProps {
  roadmaps: Roadmap[];
  viewRoadmap: (id: string) => void;
  deleteRoadmap: (id: string) => void;
}

export function RoadmapSidebar({ roadmaps, viewRoadmap, deleteRoadmap }: RoadmapSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <h3 className="mb-4 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Your blueprints</h3>
      <div className="space-y-3">
        {roadmaps.map((r) => {
          return (
            // The delete control used to be a <button> nested inside the card's
            // <button> (invalid HTML: unpredictable focus and click targets) and
            // was only revealed on mouse hover, so touch and keyboard users
            // could never reach it.
            <div key={r._id} className="group relative">
              <button
                type="button"
                onClick={() => viewRoadmap(r._id)}
                className="flex min-h-[112px] w-full flex-col justify-between rounded-2xl border border-border/70 bg-card/40 p-4 pr-12 text-left transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{r.goal}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-muted/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.duration}</span>
                  <span className="rounded-md bg-muted/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.skillLevel}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteRoadmap(r._id)}
                aria-label={`Delete roadmap: ${r.goal}`}
                className="absolute right-2 top-2 rounded-lg p-2 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {roadmaps.length === 0 && (
          <EmptyState icon={Layers} title="No blueprints yet" description="Create your first roadmap." className="min-h-[160px] border-border/30 bg-card/10 p-6" />
        )}
      </div>
    </div>
  );
}
