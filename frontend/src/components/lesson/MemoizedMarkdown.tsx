import React, { memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MemoizedMarkdown = memo(({ text }: { text: string }) => (
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
      prose-pre:border-border/30 
      prose-pre:shadow-lg 
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
      prose-th:border-border/30
      prose-th:text-left
      prose-td:p-4
      prose-td:border
      prose-td:border-border/30
      
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
      prose-img:border-border/30
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
