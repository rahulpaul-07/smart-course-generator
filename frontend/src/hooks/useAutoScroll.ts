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
    if (!isOpen) return;
    const id = setTimeout(() => scrollToBottom('auto'), 50);
    return () => clearTimeout(id);
  }, [isOpen, hasFetchedHistory]);

  // Follow the transcript whenever it grows, not only while a send is in
  // flight. Only auto-scroll if the user is already near the bottom, so
  // scrolling up to re-read is not yanked back down by an incoming token.
  useEffect(() => {
    const el = scrollAreaRef.current;
    const nearBottom =
      !el || el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom || sending) {
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
