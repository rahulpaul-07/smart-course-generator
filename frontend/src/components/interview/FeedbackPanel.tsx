import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Send, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useInterviewProgress } from '../../hooks/useInterviewProgress';

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4 rounded-xl overflow-hidden bg-[#0D0D0D] border border-border/30 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="text-[12px] overflow-x-auto tab-size-4">
        <SyntaxHighlighter language={language || 'text'} style={vscDarkPlus as any} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }} PreTag="div">
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

interface FeedbackPanelProps {
  prep: any;
}

export function FeedbackPanel({ prep }: FeedbackPanelProps) {
  const {
    message,
    setMessage,
    sending,
    chat,
    messagesEndRef,
    sendMessage,
    stopGenerating
  } = useInterviewProgress(prep);

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {chat.map((msg: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={i} 
              className={`flex w-full ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'candidate'
                  ? 'rounded-br-sm bg-foreground text-background font-medium'
                  : 'rounded-tl-sm bg-card border border-border/30 text-foreground/90'
              }`}>
                {msg.role === 'candidate' ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: ({ children, className, node, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          if (match || String(children).includes('\n')) {
                            return <CodeBlock language={match?.[1] || 'text'} value={String(children).replace(/\n$/, '')} />;
                          }
                          return <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono text-[12px]" {...props}>{children}</code>;
                        },
                      }}
                    >
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sending && chat[chat.length-1]?.role !== 'interviewer' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex gap-1.5 items-center h-[46px]">
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 border-t border-border/30 bg-card/80 backdrop-blur-xl">
        <form onSubmit={sendMessage} className="relative flex items-end gap-2">
          {sending ? (
            <button type="button" onClick={stopGenerating} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm transition-colors hover:bg-destructive/20 shadow-sm">
              <XCircle className="h-4 w-4" /> Stop Generation
            </button>
          ) : (
            <div className="relative flex-1 flex items-end bg-background border border-border/30 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message your Coach..."
                className="w-full bg-transparent px-4 py-3.5 text-sm text-foreground outline-none resize-none max-h-32"
                rows={1}
                disabled={sending}
              />
              <button type="submit" disabled={!message.trim()} className="mb-1.5 mr-1.5 shrink-0 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
