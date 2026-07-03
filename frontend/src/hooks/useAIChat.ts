import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { lessonService } from '../services/lessonService';
import { baseURL } from '../utils/api';
import type { AiConversationMessage } from '../types';

export function useAIChat(courseId: string, lessonId: string, isOpen: boolean) {
  const [messages, setMessages] = useState<AiConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const historyRef = useRef<AiConversationMessage[]>([]);

  useEffect(() => {
    let mounted = true;
    if (isOpen && !hasFetchedHistory) {
      // Deferred to a microtask so this reads as a callback invocation
      // rather than a synchronous setState call within the effect body.
      queueMicrotask(() => {
        if (!mounted) return;
        setLoadingHistory(true);
        setHistoryError(null);
        lessonService.getLesson(courseId, lessonId)
          .then(([data, err]) => {
            if (mounted) {
              if (err) {
                setHistoryError(err);
              } else if (data?.lesson?.aiConversation?.length) {
                setMessages(data.lesson.aiConversation);
              }
              setHasFetchedHistory(true);
              setLoadingHistory(false);
            }
          });
      });
    }
    return () => { mounted = false; };
  }, [isOpen, courseId, lessonId, hasFetchedHistory]);

  const clearChat = async () => {
    if (!confirm("Are you sure you want to clear the chat history?")) return;

    const previousMessages = messages;
    setMessages([]);

    const [, err] = await lessonService.clearChat(courseId, lessonId);
    if (err) {
      setMessages(previousMessages);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setSending(false);
    }
  };

  async function sendMessage(text: string = input, scrollToBottom: (behavior: ScrollBehavior) => void, inputRef: React.RefObject<HTMLTextAreaElement | null>, options?: { replaceLastMessage?: boolean }) {
    const message = text.trim();
    if (!message || sendingRef.current) return;
    sendingRef.current = true;

    // Build on the freshest state via the functional updater rather than the
    // closured `messages` value -- callers (regenerate/retry) may have just
    // truncated the array in the same tick, and a stale closure here would
    // silently re-append after the old, supposedly-removed messages.
    setMessages(prev => {
      const base = options?.replaceLastMessage && prev.length && prev[prev.length - 1].role === 'user'
        ? prev.slice(0, -1)
        : prev;
      const history: AiConversationMessage[] = [...base, { role: 'user' as const, content: message }];
      historyRef.current = history;
      return [...history, { role: 'assistant' as const, content: '' }];
    });
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSending(true);
    scrollToBottom('smooth');

    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/courses/${courseId}/lessons/${lessonId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history: historyRef.current.slice(-6) }),
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
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User aborted, keep what's completed
      } else {
        setMessages(historyRef.current);
        toast.error(error instanceof Error ? error.message : 'Could not answer that question.');
      }
    } finally {
      abortControllerRef.current = null;
      sendingRef.current = false;
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function retryLastMessage(scrollToBottom: (behavior: ScrollBehavior) => void, inputRef: React.RefObject<HTMLTextAreaElement | null>) {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user' || sendingRef.current) return;
    sendMessage(last.content, scrollToBottom, inputRef, { replaceLastMessage: true });
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    sending,
    hasFetchedHistory,
    loadingHistory,
    historyError,
    sendMessage,
    retryLastMessage,
    stopGenerating,
    clearChat
  };
}
