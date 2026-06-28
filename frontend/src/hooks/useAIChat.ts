import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { lessonService } from '../services/lessonService';

export function useAIChat(courseId: string, lessonId: string, isOpen: boolean) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;
    if (isOpen && !hasFetchedHistory) {
      setLoadingHistory(true);
      setHistoryError(null);
      lessonService.getLesson(courseId, lessonId)
        .then(([data, err]) => {
          if (mounted) {
            if (err) {
              setHistoryError(err);
            } else if (data && (data as any).lesson?.aiConversation?.length) {
              setMessages((data as any).lesson.aiConversation);
            }
            setHasFetchedHistory(true);
            setLoadingHistory(false);
          }
        });
    }
    return () => { mounted = false; };
  }, [isOpen, courseId, lessonId, hasFetchedHistory]);

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setSending(false);
    }
  };

  async function sendMessage(text: string = input, scrollToBottom: (behavior: ScrollBehavior) => void, inputRef: React.RefObject<HTMLTextAreaElement>) {
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
    stopGenerating,
    clearChat
  };
}
