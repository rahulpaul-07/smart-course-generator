import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Clock, BookOpen, Calendar, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Course } from '../../types';

interface CourseStatsProps {
  difficulty: string;
  estimatedHours: number;
  course: Pick<Course, 'createdAt' | 'updatedAt'>;
}

export function CourseStats({ difficulty, estimatedHours, course }: CourseStatsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.25 }}
    >
      <Card className="p-6 rounded-2xl border border-border/30 bg-card shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" /> Course Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Difficulty
            </span>
            <span className="text-xs font-medium text-foreground">{difficulty}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Estimated Time
            </span>
            <span className="text-xs font-medium text-foreground">~{estimatedHours} hours</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Language
            </span>
            <span className="text-xs font-medium text-foreground">English</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Generated On
            </span>
            <span className="text-xs font-medium text-foreground">{new Date(course.createdAt ?? '').toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Last Updated
            </span>
            <span className="text-xs font-medium text-foreground">{new Date(course.updatedAt || course.createdAt || '').toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" /> AI Model
            </span>
            <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded text-foreground">
              Gemini Pro
            </span>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}
