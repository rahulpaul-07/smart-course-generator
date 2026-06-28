import React from 'react';
import { Skeleton, SkeletonCard } from '../ui/skeleton';
import { Trophy } from 'lucide-react';

export function LeaderboardSkeleton() {
  return (
    <div className="page-shell">
      <section className="mb-10 text-center flex flex-col items-center">
        <p className="eyebrow flex justify-center"><Trophy className="h-3.5 w-3.5" /> Hall of Fame</p>
        <Skeleton className="h-10 w-64 rounded-md mt-3" />
        <Skeleton className="h-4 w-96 rounded-md mt-2" />
      </section>

      <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden shadow-lg border border-border/30">
        <div className="p-4 bg-foreground/10 border-b border-border/30 grid grid-cols-12 gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:grid">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Learner</div>
          <div className="col-span-3">Achievements</div>
          <div className="col-span-2 text-right pr-4">Total XP</div>
        </div>
        
        <div className="divide-y divide-border/30">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="col-span-2 flex items-center justify-between sm:justify-center">
                <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</span>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              
              <div className="col-span-5 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>

              <div className="col-span-3 flex items-center gap-4">
                <div className="flex flex-col gap-1 items-center">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded-md" />
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded-md" />
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-between sm:justify-end sm:pr-4">
                <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP</span>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
