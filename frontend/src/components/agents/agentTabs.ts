import { Bot, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const tabs = [
  { id: 'reviewer', label: 'Course Reviewer', icon: CheckCircle2, desc: 'Evaluates a course for quality and gaps.' },
  { id: 'coach', label: 'Learning Coach', icon: Bot, desc: 'Analyzes your activity and provides guidance.' },
  { id: 'planner', label: 'Revision Planner', icon: RefreshCw, desc: 'Creates a custom study schedule for you.' },
  { id: 'recommend', label: 'Recommendations', icon: Send, desc: 'Suggests what you should learn next.' },
];
