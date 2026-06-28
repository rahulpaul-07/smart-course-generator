import React, { useEffect } from 'react';
import { Mic, MicOff, Send, Square } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  onSendMessage: () => void;
  onStopGenerating: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatComposer({
  input,
  setInput,
  sending,
  onSendMessage,
  onStopGenerating,
  inputRef
}: ChatComposerProps) {
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

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
            setInput(input + transcript + ' ');
          }
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [input, setInput]);

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

  const autoGrowTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  };

  useEffect(() => {
    autoGrowTextarea();
  }, [input]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  }

  return (
    <div className="p-4 pt-2 border-t border-border/30 bg-card/50 backdrop-blur-xl">
      <div className="relative flex items-end gap-2 rounded-2xl border border-border/30 bg-background p-1.5 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
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
              onClick={onStopGenerating}
              aria-label="Stop generating"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSendMessage}
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
  );
}
