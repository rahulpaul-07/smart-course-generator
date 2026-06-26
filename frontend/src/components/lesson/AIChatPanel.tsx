import { useEffect, useRef, useState, memo } from 'react';
import { Bot, Loader2, Send, UserRound, X, Sparkles, MessageSquarePlus, Mic, MicOff, Square, Check, Copy } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  "Can you explain that more simply?",
  "Give me a real-world example",
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
    <div className="relative group my-4 rounded-lg overflow-hidden bg-background/50 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="text-[13px] leading-relaxed overflow-x-auto tab-size-4">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          PreTag="div"
          tabIndex={0}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const AssistantMessage = memo(function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-[15px] leading-relaxed text-foreground/90 prose prose-invert max-w-none 
      prose-p:leading-relaxed prose-p:my-3 
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:my-0
      prose-a:text-primary hover:prose-a:text-primary/80 
      prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-3 prose-headings:mt-6
      prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
      prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
      prose-li:my-1.5
      prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
      prose-hr:my-6 prose-hr:border-border
      prose-table:w-full prose-table:my-6 prose-th:bg-muted/50 prose-th:p-2 prose-th:border prose-th:border-border prose-th:font-semibold prose-td:p-2 prose-td:border prose-td:border-border
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
              <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[13px] text-primary" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default function AIChatPanel({ lessonId, courseId, lessonTitle, isOpen, onClose }: { lessonId: string, courseId: string, lessonTitle: string, isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
          // Fallback gracefully on error
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [isOpen, messages, sending]);

  async function sendMessage(text: string = input) {
    const message = text.trim();
    if (!message || sending) return;

    const history = [...messages, { role: 'user', content: message }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setSending(true);

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
          const messages = buffer.split('\n\n');
          // Keep the last incomplete message in the buffer
          buffer = messages.pop() || '';
          
          for (const msg of messages) {
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
                  // Ignore valid parse errors that aren't JSON issues
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
        // Only revert if we got nothing or there was an actual error before streaming
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
      className="fixed bottom-0 right-0 top-[4.5rem] z-40 flex w-full max-w-md flex-col border-l border-border bg-background/95 shadow-2xl backdrop-blur-xl"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground leading-none mb-1">AI Tutor</h2>
            <p className="truncate text-xs text-muted-foreground">{lessonTitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 scroll-smooth" aria-live="polite">
        {!messages.length && hasFetchedHistory && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">How can I help you?</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Ask me to explain concepts, provide examples, or help you understand this lesson better.
            </p>
            
            <div className="w-full space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-center gap-2">
                <MessageSquarePlus className="h-3 w-3" /> Suggested questions
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-primary'
              }`}>
                {message.role === 'user' ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm border border-border bg-muted/30'
              }`}>
                {message.role === 'user'
                  ? <p className="whitespace-pre-wrap break-words text-[15px]">{message.content}</p>
                  : <AssistantMessage content={message.content} />}
              </div>
            </motion.div>
          ))}

          {/* Removed typing indicator */}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background/95">
        <div className="relative flex items-end gap-2 rounded-xl border border-border bg-muted/20 p-1 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <Textarea
            ref={inputRef}
            aria-label="Ask a question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask a question..."
            className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 px-3 text-[15px]"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleListening}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
            className={`mb-1 ml-1 h-9 w-9 shrink-0 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {isListening ? <Mic className="h-4 w-4 animate-pulse" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
          </Button>
          {sending ? (
            <Button
              size="icon"
              onClick={stopGenerating}
              aria-label="Stop generating"
              className="mb-1 mr-1 h-9 w-9 shrink-0 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              aria-label="Send message"
              className="mb-1 mr-1 h-9 w-9 shrink-0 rounded-lg transition-transform active:scale-95"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </motion.aside>
  );
}
