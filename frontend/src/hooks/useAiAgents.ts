import { useState, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { courseService } from '../services/courseService';

export function useAiAgents() {
  const [activeTab, setActiveTab] = useState('reviewer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [goalsInput, setGoalsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    courseService.getMyCourses().then(([data, error]) => {
      if (data) {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]._id);
      }
    });
  }, []);

  const handleRunAgent = async () => {
    setLoading(true);
    setResult(null);
    try {
      let data, error;
      if (activeTab === 'reviewer') {
        if (!selectedCourse) throw new Error("Please select a course");
        [data, error] = await agentService.runReviewer(selectedCourse);
      } else if (activeTab === 'coach') {
        [data, error] = await agentService.runCoach();
      } else if (activeTab === 'planner') {
        const goals = goalsInput ? goalsInput.split(',').map(s => s.trim()) : ["Improve overall score"];
        [data, error] = await agentService.runPlanner(goals);
      } else if (activeTab === 'recommend') {
        const interests = interestsInput ? interestsInput.split(',').map(s => s.trim()) : ["General Programming"];
        [data, error] = await agentService.runRecommend(interests);
      }
      
      if (error) {
        setResult({ error });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message || "Failed to run agent." });
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    result,
    setResult,
    courses,
    selectedCourse,
    setSelectedCourse,
    goalsInput,
    setGoalsInput,
    interestsInput,
    setInterestsInput,
    handleRunAgent
  };
}
