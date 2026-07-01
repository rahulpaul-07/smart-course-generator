import { useRef, useState, useEffect } from 'react';
import type { AiConversationMessage } from '../types';

export function useAutoScroll(isOpen: boolean, hasFetchedHistory: boolean, messages: AiConversationMessage[], sending: boolean) {
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  return {
    messagesEndRef,
    scrollAreaRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll
  };
}
