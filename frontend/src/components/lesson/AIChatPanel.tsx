import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';
import { useAutoScroll } from '../../hooks/useAutoScroll';

import { ChatHeader } from '../chat/ChatHeader';
import { ChatMessageList } from '../chat/ChatMessageList';
import { ChatComposer } from '../chat/ChatComposer';
import { SuggestedPrompts } from '../chat/SuggestedPrompts';

export default function AIChatPanel({ lessonId, courseId, lessonTitle, isOpen, onClose }: { lessonId: string, courseId: string, lessonTitle: string, isOpen: boolean, onClose: () => void }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    setMessages,
    input,
    setInput,
    sending,
    hasFetchedHistory,
    sendMessage,
    stopGenerating,
    clearChat
  } = useAIChat(courseId, lessonId, isOpen);

  const {
    messagesEndRef,
    scrollAreaRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll
  } = useAutoScroll(isOpen, hasFetchedHistory, messages, sending);

  if (!isOpen) return null;

  return (
    <motion.aside 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 right-0 top-[4.5rem] z-50 flex w-full max-w-md flex-col border-l border-border/30 bg-background shadow-lg"
    >
      <ChatHeader 
        lessonTitle={lessonTitle}
        hasMessages={messages.length > 0}
        onClearChat={clearChat}
        onClose={onClose}
      />

      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 space-y-6 overflow-y-auto p-5 scroll-smooth relative" 
        aria-live="polite"
      >
        {!messages.length && hasFetchedHistory && (
          <SuggestedPrompts onSelect={(text) => {
            setInput(text);
            sendMessage(text, scrollToBottom, inputRef);
          }} />
        )}

        <ChatMessageList 
          messages={messages} 
          sending={sending} 
          onRegenerate={(index) => {
            const previousMessages = messages.slice(0, index);
            setMessages(previousMessages);
            sendMessage(messages[index - 1].content, scrollToBottom, inputRef);
          }} 
        />
        
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

      <ChatComposer
        input={input}
        setInput={setInput}
        sending={sending}
        onSendMessage={() => sendMessage(input, scrollToBottom, inputRef)}
        onStopGenerating={stopGenerating}
        inputRef={inputRef}
      />
    </motion.aside>
  );
}
