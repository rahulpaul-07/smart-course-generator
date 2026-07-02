import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MemoizedBlock } from './MemoizedBlock';
import type { LessonContentBlock } from '../../types';

const LessonRenderer = React.memo(({ content = [], isStreaming = false }: { content: LessonContentBlock[], isStreaming?: boolean }) => {
  if (!content.length && !isStreaming) {
    return (
      <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/20 backdrop-blur-sm">
        <p className="text-muted-foreground text-lg">Generate the lesson to begin learning.</p>
      </div>
    );
  }

  return (
    <article id="lesson-content" data-print-content className="space-y-2 text-[17px] leading-relaxed text-foreground/90 font-sans">
      {content.map((block, index) => <MemoizedBlock key={index} block={block} />)}

      {isStreaming && (
        <div className="space-y-6 pt-12 animate-pulse">
          <Skeleton className="h-6 w-3/4 rounded-md bg-muted/60" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded-md bg-muted/40" />
            <Skeleton className="h-4 w-[90%] rounded-md bg-muted/40" />
            <Skeleton className="h-4 w-[95%] rounded-md bg-muted/40" />
            <Skeleton className="h-4 w-[80%] rounded-md bg-muted/40" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl bg-muted/30" />
        </div>
      )}
    </article>
  );
});

export default LessonRenderer;
