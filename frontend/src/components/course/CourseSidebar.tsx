import React from 'react';
import { SkillSection } from './SkillSection';
import { CourseStats } from './CourseStats';
import { CourseActions } from './CourseActions';

interface CourseSidebarProps {
  skills: any[];
  difficulty: string;
  estimatedHours: number;
  course: any;
  progress: any;
  nextLessonId: string | null;
  courseId: string | undefined;
}

export function CourseSidebar({ skills, difficulty, estimatedHours, course, progress, nextLessonId, courseId }: CourseSidebarProps) {
  return (
    <div className="space-y-8 sticky top-24">
      <SkillSection skills={skills} />
      <CourseStats difficulty={difficulty} estimatedHours={estimatedHours} course={course} />
      <CourseActions progress={progress} nextLessonId={nextLessonId} courseId={courseId} />
    </div>
  );
}
