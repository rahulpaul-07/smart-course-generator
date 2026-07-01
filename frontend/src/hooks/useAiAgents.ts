import { useState, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { courseService } from '../services/courseService';
import type { Course } from '../types';

interface PlannerScheduleItem {
  day?: string;
  topic?: string;
  method?: string;
}

interface RecommendationItem {
  topic?: string;
  reason?: string;
}

/** The AI agent endpoints (reviewer/coach/planner/recommend) each return a
 * differently-shaped payload. Rather than a discriminated union (the active
 * tab already tells the view which fields are relevant), this models the
 * superset of fields any agent response or local error may carry. */
export interface AgentResult {
  error?: string;
  // reviewer
  rating?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestedImprovements?: string[];
  // coach
  greeting?: string;
  encouragement?: string;
  analysis?: string;
  actionableAdvice?: string[];
  // planner
  planName?: string;
  schedule?: PlannerScheduleItem[];
  // recommend
  recommendations?: RecommendationItem[];
}

export function useAiAgents() {
  const [activeTab, setActiveTab] = useState('reviewer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [goalsInput, setGoalsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    courseService.getMyCourses().then(([data]) => {
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
        setResult(data as AgentResult);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to run agent.";
      setResult({ error: message });
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
