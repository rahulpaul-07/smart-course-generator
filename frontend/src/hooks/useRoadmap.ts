import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '../services/roadmapService';
import { courseService } from '../services/courseService';
import { useSessionStorage } from './useStorage';

export function useRoadmap() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [activeRoadmap, setActiveRoadmap] = useSessionStorage<any>('roadmap_active', null);

  const navigate = useNavigate();

  useEffect(() => {
    loadRoadmaps();
  }, []);

  async function loadRoadmaps() {
    const [data] = await roadmapService.getMyRoadmaps();
    if (data) setRoadmaps(data);
    setLoading(false);
  }

  async function generateRoadmap(form: { goal: string; duration: string; skillLevel: string }) {
    if (!form.goal.trim()) {
      toast.error('Please enter a learning goal');
      return false;
    }
    setGenerating(true);
    const [data] = await roadmapService.generateRoadmap(form);
    if (data) {
      setRoadmaps((prev) => [data, ...prev]);
      setActiveRoadmap(data);
      toast.success('Roadmap generated!');
      setGenerating(false);
      return true;
    }
    setGenerating(false);
    return false;
  }

  async function viewRoadmap(id: string) {
    const [data] = await roadmapService.getRoadmap(id);
    if (data) setActiveRoadmap(data);
  }

  async function deleteRoadmap(id: string) {
    if (!window.confirm('Delete this roadmap?')) return;
    const [data, error] = await roadmapService.deleteRoadmap(id);
    if (!error) {
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      if (activeRoadmap?._id === id) setActiveRoadmap(null);
    }
  }

  async function generateCourseFromTopic(topic: string) {
    const [data] = await courseService.generateCourse({ prompt: topic });
    if (data) navigate(`/course/${data._id}`);
  }

  return {
    roadmaps,
    loading,
    generating,
    activeRoadmap,
    setActiveRoadmap,
    generateRoadmap,
    viewRoadmap,
    deleteRoadmap,
    generateCourseFromTopic
  };
}
