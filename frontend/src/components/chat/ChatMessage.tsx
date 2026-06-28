import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, UserRound, Copy, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden bg-[#0D0D0D] border border-border/30 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/30">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-md"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="text-[13px] leading-relaxed overflow-x-auto tab-size-4">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus as any}
          customStyle={{ margin: 0, padding: '1rem 1.25rem', background: 'transparent' }}
          PreTag="div"
          tabIndex={0}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const AssistantMessageContent = memo(function AssistantMessageContent({ content, isStreaming }: { content: string, isStreaming?: boolean }) {
  return (
    <div className="min-w-0 text-[15px] leading-relaxed text-foreground/90 prose prose-invert max-w-none 
      prose-p:leading-relaxed prose-p:my-3 
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:my-0
      prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:text-primary/80 
      prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6 prose-headings:tracking-tight
      prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
      prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
      prose-li:my-1.5
      prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-muted-foreground
      prose-hr:my-6 prose-hr:border-border/30
      prose-table:w-full prose-table:my-6 prose-table:rounded-lg prose-table:overflow-hidden
      prose-th:bg-muted/30 prose-th:p-3 prose-th:border prose-th:border-border/30 prose-th:font-semibold prose-th:text-left
      prose-td:p-3 prose-td:border prose-td:border-border/30
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ children, className, node, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = match || String(children).includes('\n');
            if (isBlock) {
              return <CodeBlock language={match?.[1] || 'text'} value={String(children).replace(/\n$/, '')} />;
            }
            return (
              <code className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[13px] text-primary" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
});

interface ChatMessageProps {
  message: any;
  isUser: boolean;
  isStreamingThis: boolean;
  onRegenerate?: () => void;
}

export function ChatMessage({ message, isUser, isStreamingThis, onRegenerate }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary mt-1">
          <Bot className="h-4 w-4" />
        </div>
      )}
      
      <div className={`flex flex-col gap-1.5 min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2.5 shadow-sm overflow-hidden ${
          isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm border border-border/30 bg-muted/20'
        }`}>
          {isUser
            ? <p className="whitespace-pre-wrap break-words text-[14px] font-medium leading-relaxed">{message.content}</p>
            : <AssistantMessageContent content={message.content} isStreaming={isStreamingThis} />}
        </div>
        
        {!isUser && !isStreamingThis && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <button onClick={() => {
              navigator.clipboard.writeText(message.content);
              toast.success('Copied to clipboard');
            }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Copy">
              <Copy className="h-3 w-3" />
            </button>
            <button onClick={onRegenerate} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Regenerate">
              <RefreshCw className="h-3 w-3" />
            </button>
            <div className="w-px h-3 bg-border mx-1" />
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Helpful">
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Not helpful">
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/30 text-foreground mt-1">
          <UserRound className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
