import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';

interface ChatMessageListProps {
  messages: any[];
  sending: boolean;
  onRegenerate: (index: number) => void;
}

export function ChatMessageList({ messages, sending, onRegenerate }: ChatMessageListProps) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isLast = index === messages.length - 1;
        const isStreamingThis = isLast && sending && !isUser;

        return (
          <ChatMessage 
            key={`${message.role}-${index}`}
            message={message}
            isUser={isUser}
            isStreamingThis={isStreamingThis}
            onRegenerate={() => onRegenerate(index)}
          />
        );
      })}
    </AnimatePresence>
  );
}
