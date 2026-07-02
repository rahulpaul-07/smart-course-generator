import React from 'react';
import { SkillSection } from './SkillSection';
import { CourseStats } from './CourseStats';
import { CourseActions } from './CourseActions';
import { courseProgress } from '../../utils/courseProgress';
import type { PopulatedCourse } from '../../types';

interface CourseSidebarProps {
  skills: { name: string; icon: React.ElementType }[];
  difficulty: string;
  estimatedHours: number;
  course: Pick<PopulatedCourse, 'createdAt' | 'updatedAt'>;
  progress: ReturnType<typeof courseProgress>;
  nextLessonId: string | null;
  courseId: string | undefined;
}

export function CourseSidebar({ skills, difficulty, estimatedHours, course, progress, nextLessonId, courseId }: CourseSidebarProps) {
  return (
    <div className="space-y-6 sticky top-24">
      <SkillSection skills={skills} />
      <CourseStats difficulty={difficulty} estimatedHours={estimatedHours} course={course} />
      <CourseActions progress={progress} nextLessonId={nextLessonId} courseId={courseId} />
    </div>
  );
}
