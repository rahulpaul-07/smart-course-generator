import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import type { AiConversationMessage } from '../../types';

interface ChatMessageListProps {
  messages: AiConversationMessage[];
  sending: boolean;
  onRegenerate: (index: number) => void;
  onRetry?: () => void;
}

export function ChatMessageList({ messages, sending, onRegenerate, onRetry }: ChatMessageListProps) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isLast = index === messages.length - 1;
        const isStreamingThis = isLast && sending && !isUser;
        // A trailing user message with no assistant reply only happens when
        // the previous send attempt failed (a normal in-flight send always
        // has an assistant placeholder appended right after it).
        const canRetry = isUser && isLast && !sending;

        return (
          <ChatMessage
            key={`${message.role}-${index}`}
            message={message}
            isUser={isUser}
            isStreamingThis={isStreamingThis}
            onRegenerate={() => onRegenerate(index)}
            canRetry={canRetry}
            onRetry={onRetry}
          />
        );
      })}
    </AnimatePresence>
  );
}
