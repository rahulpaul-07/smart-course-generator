import { useEffect, useRef, useState, memo } from 'react';
import { 
  Bot, Loader2, Send, UserRound, X, Sparkles, MessageSquarePlus, 
  Mic, MicOff, Square, Check, Copy, RefreshCw, Trash2, 
  ThumbsUp, ThumbsDown, ArrowDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import React from 'react';

const SUGGESTIONS = [
  "Can you explain that more simply?",
  "Give me a real-world example.",
  "How does this connect to the previous topic?",
];

const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden bg-[#0D0D0D] border border-border/40 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/40">
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
          style={vscDarkPlus}
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

const AssistantMessage = memo(function AssistantMessage({ content, isStreaming }: { content: string, isStreaming?: boolean }) {
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
      prose-hr:my-6 prose-hr:border-border/40
      prose-table:w-full prose-table:my-6 prose-table:rounded-lg prose-table:overflow-hidden
      prose-th:bg-muted/30 prose-th:p-3 prose-th:border prose-th:border-border/40 prose-th:font-semibold prose-th:text-left
      prose-td:p-3 prose-td:border prose-td:border-border/40
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

export default function AIChatPanel({ lessonId, courseId, lessonTitle, isOpen, onClose }: { lessonId: string, courseId: string, lessonTitle: string, isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setSending(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      // API call to clear history could go here if implemented on backend
    }
  };

  useEffect(() => {
    let mounted = true;
    if (isOpen && !hasFetchedHistory) {
      api.get(`/courses/${courseId}/lessons/${lessonId}`)
        .then(({ data }) => {
          if (mounted && data.lesson?.aiConversation?.length) {
            setMessages(data.lesson.aiConversation);
          }
          if (mounted) {
            setHasFetchedHistory(true);
          }
        })
        .catch(() => {
          if (mounted) setHasFetchedHistory(true);
        });
    }
    return () => { mounted = false; };
  }, [isOpen, courseId, lessonId, hasFetchedHistory]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput((prev) => prev + transcript + ' ');
          }
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom('auto'), 50);
    }
  }, [isOpen, hasFetchedHistory]);

  useEffect(() => {
    if (sending) {
      scrollToBottom('auto');
    }
  }, [messages, sending]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 150);
  };

  const autoGrowTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  };

  useEffect(() => {
    autoGrowTextarea();
  }, [input]);

  async function sendMessage(text: string = input) {
    const message = text.trim();
    if (!message || sending) return;

    const history = [...messages, { role: 'user', content: message }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSending(true);
    scrollToBottom('smooth');

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}/lessons/${lessonId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message, history: messages.slice(-6) }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let streamedContent = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const streamMessages = buffer.split('\n\n');
          buffer = streamMessages.pop() || '';
          
          for (const msg of streamMessages) {
            const lines = msg.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const dataStr = line.slice(6);
                  if (dataStr === '[DONE]') continue;
                  
                  const data = JSON.parse(dataStr);
                  if (data.error) throw new Error(data.error);
                  if (data.status === 'complete') continue;
                  
                  streamedContent += data;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: streamedContent };
                    return newMsgs;
                  });
                } catch (e) {
                  if (e instanceof Error && e.message !== 'Unexpected end of JSON input' && !e.message.includes('Unexpected token')) {
                    throw e;
                  }
                }
              }
            }
          }
        }
      }
      
      if (!streamedContent.trim()) {
        throw new Error('Empty response');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User aborted, keep what's completed
      } else {
        setMessages(history); 
        toast.error(error.message || 'Could not answer that question.');
      }
    } finally {
      abortControllerRef.current = null;
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <motion.aside 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 right-0 top-[4.5rem] z-50 flex w-full max-w-md flex-col border-l border-border/50 bg-background shadow-2xl"
    >
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card/50 backdrop-blur-xl px-5 py-4 z-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-foreground leading-none mb-1.5 tracking-tight">AI Tutor</h2>
            <p className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{lessonTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Clear chat">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 space-y-6 overflow-y-auto p-5 scroll-smooth relative" 
        aria-live="polite"
      >
        {!messages.length && hasFetchedHistory && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center px-4 max-w-sm mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-inner border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 font-serif">How can I help you?</h3>
            <p className="text-sm font-medium text-muted-foreground mb-10 leading-relaxed">
              Ask me to explain concepts, provide examples, or help you understand this lesson better.
            </p>
            
            <div className="w-full space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <MessageSquarePlus className="h-3 w-3" /> Suggested questions
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-5 py-3 rounded-xl border border-border/50 bg-muted/20 text-[13px] font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const isLast = index === messages.length - 1;
            const isStreamingThis = isLast && sending && !isUser;

            return (
              <motion.div
                key={`${message.role}-${index}`}
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
                      : 'rounded-tl-sm border border-border/40 bg-muted/20'
                  }`}>
                    {isUser
                      ? <p className="whitespace-pre-wrap break-words text-[14px] font-medium leading-relaxed">{message.content}</p>
                      : <AssistantMessage content={message.content} isStreaming={isStreamingThis} />}
                  </div>
                  
                  {!isUser && !isStreamingThis && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      <button onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast.success('Copied to clipboard');
                      }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Copy">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button onClick={() => {
                        const previousMessages = messages.slice(0, index);
                        setMessages(previousMessages);
                        sendMessage(messages[index - 1].content);
                      }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Regenerate">
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50 text-foreground mt-1">
                    <UserRound className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {showScrollBottom && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-20">
          <button 
            onClick={() => scrollToBottom('smooth')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-md hover:bg-muted transition-colors text-foreground"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-4 pt-2 border-t border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-background p-1.5 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            ref={inputRef}
            aria-label="Ask a question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message AI Tutor..."
            className="w-full min-h-[40px] max-h-32 resize-none border-0 bg-transparent py-2.5 px-3 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            style={{ overflowY: input.length > 50 ? 'auto' : 'hidden' }}
          />
          
          <div className="flex items-center gap-1 shrink-0 mb-0.5 mr-0.5">
            <button
              onClick={toggleListening}
              aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
              className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            </button>
            
            {sending ? (
              <button
                onClick={stopGenerating}
                aria-label="Stop generating"
                className="flex items-center justify-center h-8 w-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
          Enter to send <span className="opacity-50 mx-1">•</span> Shift + Enter for new line
        </p>
      </div>
    </motion.aside>
  );
}
