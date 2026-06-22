import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, UserRound, X, Sparkles, MessageSquarePlus, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-sm leading-relaxed text-foreground/90 prose prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-a:text-primary hover:prose-a:text-primary/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-') || String(children).includes('\n');
            return (
              <code className={isBlock ? `${className || ''} text-[13px]` : 'rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[13px] text-primary'}>
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
}

export default function AIChatPanel({ lessonId, lessonTitle, isOpen, onClose }: { lessonId: string, lessonTitle: string, isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
    setMessages(history);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/chat`, {
        message,
        history: messages.slice(-6),
      });
      setMessages([...history, {
        role: 'assistant',
        content: String(data.reply || '').trim() || 'I could not find an answer for that question.',
      }]);
    } catch {
      setMessages([...history, { role: 'assistant', content: 'Could not answer that question.' }]);
    } finally {
      setSending(false);
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

      <div className="flex-1 space-y-6 overflow-y-auto p-4 scroll-smooth">
        {!messages.length && (
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

          {sending && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-muted/30 px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background/95">
        <div className="relative flex items-end gap-2 rounded-xl border border-border bg-muted/20 p-1 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <Textarea
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
            className={`mb-1 ml-1 h-9 w-9 shrink-0 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="mb-1 mr-1 h-9 w-9 shrink-0 rounded-lg transition-transform active:scale-95"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </motion.aside>
  );
}
