import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSessionStorage } from './useStorage';

export function useInterviewProgress(prep: any) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useSessionStorage<any[]>(
    `interview_mock_${prep?._id}`,
    () => {
      if (!prep) return [];
      return prep.mockChat || [{ role: 'interviewer', content: `Hello! I'm your AI interviewer for the **${prep.topic}** role. Are you ready to begin?` }];
    }
  );
  
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (prep) {
      setTimeout(scrollToBottom, 50);
    }
  }, [chat, prep?._id]);

  async function sendMessage(e?: any) {
    e?.preventDefault();
    if (!message.trim() || sending || !prep) return;
    const text = message.trim();
    setMessage('');
    
    const newChat = [...chat, { role: 'candidate', content: text }];
    setChat(newChat);
    setSending(true);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${prep._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      setChat([...newChat, { role: 'interviewer', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.text) {
                assistantMessage += data.text;
                setChat(prev => {
                  const last = prev[prev.length - 1];
                  if (last.role === 'interviewer') {
                    return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
                  }
                  return prev;
                });
              }
            } catch (err) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to send message');
        setChat(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'interviewer' && !last.content) return prev.slice(0, -1);
          return prev;
        });
      }
    } finally {
      setSending(false);
      setAbortController(null);
    }
  }

  function stopGenerating() {
    if (abortController) abortController.abort();
  }

  return {
    message,
    setMessage,
    sending,
    chat,
    messagesEndRef,
    sendMessage,
    stopGenerating
  };
}
