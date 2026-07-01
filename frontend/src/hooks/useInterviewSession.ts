import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { useSessionStorage } from './useStorage';
import type { InterviewPrep } from '../types';

export function useInterviewSession() {
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  
  const [activePrep, setActivePrep] = useSessionStorage<InterviewPrep | null>('interview_active_prep', null);
  const [activeTab, setActiveTab] = useSessionStorage<string>('interview_active_tab', 'mcq');

  const [isMobileCoachOpen, setIsMobileCoachOpen] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activePrep && activePrep.status === 'pending') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activePrep]);

  useEffect(() => { loadPreps(); }, []);

  async function loadPreps() {
    setError('');
    const [data, err] = await interviewService.getMyInterviews();
    if (data) setPreps(data);
    else if (err) setError(err);
    setLoading(false);
  }

  async function generate(e: React.FormEvent, setElapsedTime: (t: number) => void) {
    e.preventDefault();
    if (!topic.trim()) return toast.error('Enter a topic');
    
    const pendingPrep = preps.find(p => p.status === 'pending');
    if (pendingPrep) {
      if (window.confirm('You have an interview in progress. Click OK to continue previous interview, or Cancel to start a new one.')) {
        viewPrep(pendingPrep._id);
        setTopic('');
        return;
      }
    }
    
    setGenerating(true);
    const [data] = await interviewService.generateInterview(topic.trim());
    setGenerating(false);
    
    if (data) {
      setPreps((p) => [data, ...p]);
      setActivePrep(data);
      setActiveTab('mcq');
      setTopic('');
      setElapsedTime(0);
      toast.success('Interview pack generated!');
    }
  }

  async function viewPrep(id: string) {
    const [data] = await interviewService.getInterview(id);
    if (data) {
      setActivePrep(data);
      setActiveTab('mcq');
    }
  }

  async function deletePrep(id: string) {
    if (!window.confirm('Delete this interview prep?')) return;
    const [, error] = await interviewService.deleteInterview(id);
    if (!error) {
      setPreps((p) => p.filter((x) => x._id !== id));
      if (activePrep?._id === id) setActivePrep(null);
    }
  }

  return {
    preps,
    loading,
    error,
    generating,
    topic,
    setTopic,
    activePrep,
    setActivePrep,
    activeTab,
    setActiveTab,
    isMobileCoachOpen,
    setIsMobileCoachOpen,
    generate,
    viewPrep,
    deletePrep,
    refetch: loadPreps
  };
}
