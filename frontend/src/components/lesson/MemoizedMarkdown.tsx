import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Typography for generated lesson prose. Kept as a list so each group can be
// commented; comments inside a className string end up as bogus class names.
const PROSE_CLASSES = cn(
  // overflow-wrap:anywhere breaks long URLs and identifiers instead of letting
  // them push the lesson column past the viewport.
  'prose dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] text-foreground/90 leading-7',
  // Paragraphs: regular weight at a comfortable reading size.
  'prose-p:my-5 prose-p:text-base sm:prose-p:text-[17px]',
  'prose-strong:font-semibold prose-strong:text-foreground',
  // Inline code
  'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:text-foreground',
  // Code blocks
  'prose-pre:my-6 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-[#0D0D0D] prose-pre:p-5',
  // Tables scroll horizontally on narrow screens.
  'prose-table:my-6 prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-table:border-collapse',
  'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-left',
  'prose-td:border prose-td:border-border prose-td:p-3',
  // Blockquotes
  'prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-foreground',
  'prose-img:my-8 prose-img:w-full prose-img:rounded-lg prose-img:border prose-img:border-border',
  'prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1.5',
  'prose-a:text-primary prose-a:underline-offset-4',
);

export const MemoizedMarkdown = memo(({ text }: { text: string }) => (
  <div className={PROSE_CLASSES}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
  </div>
));
