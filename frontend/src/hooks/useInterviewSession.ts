import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { useSessionStorage } from './useStorage';

export function useInterviewSession() {
  const [preps, setPreps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  
  const [activePrep, setActivePrep] = useSessionStorage<any>('interview_active_prep', null);
  const [activeTab, setActiveTab] = useSessionStorage<string>('interview_active_tab', 'mcq');

  const [isMobileCoachOpen, setIsMobileCoachOpen] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
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
    const [data] = await interviewService.getMyInterviews();
    if (data) setPreps(data);
    setLoading(false);
  }

  async function generate(e: any, setElapsedTime: (t: number) => void) {
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
    const [data, error] = await interviewService.deleteInterview(id);
    if (!error) {
      setPreps((p) => p.filter((x) => x._id !== id));
      if (activePrep?._id === id) setActivePrep(null);
    }
  }

  return {
    preps,
    loading,
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
    deletePrep
  };
}
