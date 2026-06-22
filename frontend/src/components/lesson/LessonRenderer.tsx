import CalloutBlock from '../blocks/CalloutBlock';
import CodeSnippet from '../blocks/CodeSnippet';
import ListBlock from '../blocks/ListBlock';
import VideoBlock from '../blocks/VideoBlock';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LessonRenderer({ content = [], isStreaming = false }: { content: any[], isStreaming?: boolean }) {
  if (!content.length && !isStreaming) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-muted/20">
        <p className="text-muted-foreground">Generate the lesson to begin learning.</p>
      </div>
    );
  }

  return (
    <article id="lesson-content" data-print-content className="space-y-6 text-[17px] leading-relaxed text-foreground">
      {content.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.level === 3 ? 'h3' : 'h2';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Heading
                className={`font-bold text-foreground tracking-tight ${
                  block.level === 3
                    ? 'pt-6 text-2xl'
                    : 'mt-12 border-t border-border/50 pt-10 text-3xl'
                }`}
              >
                {block.text}
              </Heading>
            </motion.div>
          );
        }
        if (block.type === 'code') return <CodeSnippet key={index} block={block} />;
        if (block.type === 'list') return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={index}><ListBlock block={block} /></motion.div>;
        if (block.type === 'callout') return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={index}><CalloutBlock block={block} /></motion.div>;
        if (block.type === 'video') return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={index}><VideoBlock block={block} /></motion.div>;
        if (block.text) return (
          <motion.div 
            key={index} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-muted-foreground leading-[1.8] prose prose-invert prose-p:my-2 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none break-words overflow-wrap-anywhere prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {block.text}
            </ReactMarkdown>
          </motion.div>
        );
        return null;
      })}

      {isStreaming && (
        <div className="space-y-4 pt-4 animate-pulse">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      )}
    </article>
  );
}
