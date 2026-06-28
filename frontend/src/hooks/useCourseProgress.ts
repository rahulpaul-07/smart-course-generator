import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Code2, Layers3, Shield, Brain, BookOpen } from 'lucide-react';
import { courseService } from '../services/courseService';
import { courseProgress } from '../utils/courseProgress';
import { calculateEstimatedHours } from '../utils/durations';

export function useCourseProgress(id: string | undefined) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    courseService.getCourse(id).then(([data]) => {
      if (active && data) {
        setCourse(data);
      }
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  if (!course) {
    return { course, loading, progress: null, estimatedHours: 0, difficulty: '', skills: [], nextLessonId: null, setCourse };
  }

  const progress = courseProgress(course);
  
  const totalLessons = progress.totalLessons || 0;
  const estimatedHours = calculateEstimatedHours(totalLessons);
  
  const difficulty = course.difficulty || 'Intermediate';

  const skills = [
    { name: course.title.split(' ')[0] || 'Fundamentals', icon: Code2 },
    { name: 'System Design', icon: Layers3 },
    { name: 'Best Practices', icon: Shield },
    { name: 'Problem Solving', icon: Brain },
    { name: 'Architecture', icon: BookOpen }
  ].slice(0, Math.max(3, Math.min(5, Math.ceil(totalLessons / 3))));

  let nextLessonId = null;
  for (const mod of (course.modules || [])) {
    const uncompleted = mod.lessons?.find((l: any) => !l.completedAt);
    if (uncompleted) {
      nextLessonId = uncompleted._id;
      break;
    }
  }
  if (!nextLessonId && course.modules?.[0]?.lessons?.[0]) {
    nextLessonId = course.modules[0].lessons[0]._id;
  }

  return {
    course,
    loading,
    progress,
    estimatedHours,
    difficulty,
    skills,
    nextLessonId,
    setCourse
  };
}
