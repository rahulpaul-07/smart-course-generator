import React, { memo } from 'react';
import { motion } from 'framer-motion';
import CalloutBlock from '../blocks/CalloutBlock';
import CodeSnippet from '../blocks/CodeSnippet';
import ListBlock from '../blocks/ListBlock';
import VideoBlock from '../blocks/VideoBlock';
import { MemoizedMarkdown } from './MemoizedMarkdown';
import type { LessonContentBlock } from '../../types';

interface HeadingBlock extends LessonContentBlock {
  type: 'heading';
  level?: number;
  text?: string;
}

interface ListBlockData extends LessonContentBlock {
  type: 'list';
  style?: string;
  items: string[];
}

export const MemoizedBlock = memo(({ block }: { block: LessonContentBlock }) => {
  if (block.type === 'heading') {
    const headingBlock = block as HeadingBlock;
    const Heading = headingBlock.level === 3 ? 'h3' : 'h2';
    // Generate an ID for Table of Contents based on the text
    const id = headingBlock.text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Heading
          id={id}
          className={`font-extrabold text-foreground tracking-tight scroll-mt-24 ${
            headingBlock.level === 3
              ? 'mt-10 mb-4 text-2xl font-sans'
              : 'mt-16 mb-6 pb-4 border-b border-border/30 text-3xl md:text-4xl font-display'
          }`}
        >
          {headingBlock.text}
        </Heading>
      </motion.div>
    );
  }
  if (block.type === 'code') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><CodeSnippet block={block} /></motion.div>;
  if (block.type === 'list') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><ListBlock block={block as ListBlockData} /></motion.div>;
  if (block.type === 'callout') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><CalloutBlock block={block} /></motion.div>;
  if (block.type === 'video') return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><VideoBlock block={block} /></motion.div>;
  if (typeof block.text === 'string') return <MemoizedMarkdown text={block.text} />;
  return null;
}, (prev, next) => {
  return JSON.stringify(prev.block) === JSON.stringify(next.block);
});
