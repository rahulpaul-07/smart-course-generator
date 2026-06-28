import CalloutBlock from '../blocks/CalloutBlock';
import CodeSnippet from '../blocks/CodeSnippet';
import ListBlock from '../blocks/ListBlock';
import VideoBlock from '../blocks/VideoBlock';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';
import React from 'react';

const MemoizedMarkdown = memo(({ text }: { text: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="
      text-foreground/90 
      leading-[1.8] 
      prose 
      prose-lg 
      prose-invert 
      max-w-none 
      break-words 
      overflow-wrap-anywhere 
      
      /* Paragraphs */
      prose-p:my-6 
      prose-p:text-[17px] 
      prose-p:font-medium
      
      /* Bold / Strong */
      prose-strong:text-foreground 
      prose-strong:font-bold
      
      /* Inline Code */
      prose-code:text-primary 
      prose-code:bg-primary/10 
      prose-code:px-1.5 
      prose-code:py-0.5 
      prose-code:rounded-md 
      prose-code:font-mono
      prose-code:text-[0.9em]
      
      /* Preformatted Code Blocks */
      prose-pre:overflow-x-auto 
      prose-pre:max-w-full 
      prose-pre:bg-[#0D0D0D] 
      prose-pre:border 
      prose-pre:border-border/40 
      prose-pre:shadow-2xl 
      prose-pre:rounded-2xl
      prose-pre:my-8
      prose-pre:p-5
      
      /* Tables */
      prose-table:block 
      prose-table:overflow-x-auto
      prose-table:w-full
      prose-table:border-collapse
      prose-table:my-8
      prose-th:bg-muted/30
      prose-th:p-4
      prose-th:border
      prose-th:border-border/50
      prose-th:text-left
      prose-td:p-4
      prose-td:border
      prose-td:border-border/50
      
      /* Blockquotes */
      prose-blockquote:border-l-4 
      prose-blockquote:border-primary 
      prose-blockquote:bg-gradient-to-r 
      prose-blockquote:from-primary/10 
      prose-blockquote:to-transparent 
      prose-blockquote:py-3 
      prose-blockquote:px-6 
      prose-blockquote:my-8
      prose-blockquote:rounded-r-xl 
      prose-blockquote:font-serif
      prose-blockquote:italic
      prose-blockquote:text-xl
      prose-blockquote:text-foreground
      
      /* Images */
      prose-img:rounded-2xl 
      prose-img:shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
      prose-img:my-12
      prose-img:border
      prose-img:border-border/40
      prose-img:w-full
      prose-img:object-cover
      
      /* Lists */
      prose-ul:my-6
      prose-ul:list-disc
      prose-ul:pl-6
      prose-ol:my-6
      prose-ol:list-decimal
      prose-ol:pl-6
      prose-li:my-2
      marker:text-primary
      
      /* Links */
      prose-a:text-primary 
      prose-a:underline-offset-4
      prose-a:decoration-primary/30
      hover:prose-a:decoration-primary
      transition-all
    "
  >
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {text}
    </ReactMarkdown>
  </motion.div>
));

const MemoizedBlock = memo(({ block, index }: { block: any, index: number }) => {
  if (block.type === 'heading') {
    const Heading = block.level === 3 ? 'h3' : 'h2';
    // Generate an ID for Table of Contents based on the text
    const id = block.text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Heading
          id={id}
          className={`font-extrabold text-foreground tracking-tight scroll-mt-24 ${
            block.level === 3
              ? 'mt-10 mb-4 text-2xl font-sans'
              : 'mt-16 mb-6 pb-4 border-b border-border/40 text-3xl md:text-4xl font-serif'
          }`}
        >
          {block.text}
        </Heading>
      </motion.div>
    );
  }
  if (block.type === 'code') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><CodeSnippet block={block} /></motion.div>;
  if (block.type === 'list') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><ListBlock block={block} /></motion.div>;
  if (block.type === 'callout') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><CalloutBlock block={block} /></motion.div>;
  if (block.type === 'video') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><VideoBlock block={block} /></motion.div>;
  if (block.text) return <MemoizedMarkdown text={block.text} />;
  return null;
}, (prev, next) => {
  return JSON.stringify(prev.block) === JSON.stringify(next.block);
});

export default function LessonRenderer({ content = [], isStreaming = false }: { content: any[], isStreaming?: boolean }) {
  if (!content.length && !isStreaming) {
    return (
      <div className="p-16 text-center rounded-3xl border border-dashed border-border bg-card/20 backdrop-blur-sm">
        <p className="text-muted-foreground text-lg">Generate the lesson to begin learning.</p>
      </div>
    );
  }

  return (
    <article id="lesson-content" data-print-content className="space-y-2 text-[17px] leading-relaxed text-foreground/90 font-sans">
      {content.map((block, index) => <MemoizedBlock key={index} block={block} index={index} />)}

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
}
