import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';

import { useFocusMode } from '../hooks/useFocusMode';
import { useLessonNavigation } from '../hooks/useLessonNavigation';
import { useLessonProgress } from '../hooks/useLessonProgress';

import { LessonLayout } from '../components/lesson/LessonLayout';
import { LessonHeader } from '../components/lesson/LessonHeader';
import { LessonContent } from '../components/lesson/LessonContent';

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const lessonScrollRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);

  const { isFocusMode, setIsFocusMode } = useFocusMode();
  
  const { 
    course, 
    lesson, 
    loading, 
    prevLesson, 
    nextLesson, 
    updateCurrentLesson,
    setLesson
  } = useLessonNavigation(courseId, lessonId);

  const {
    generating,
    showDepthPicker,
    setShowDepthPicker,
    streamStatus,
    streamError,
    streamStage,
    selectedDepth,
    setSelectedDepth,
    selectedLanguage,
    setSelectedLanguage,
    addingVideos,
    streamedCount,
    generateLesson,
    addVideos
  } = useLessonProgress(courseId, lessonId, updateCurrentLesson, setLesson);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner text="Loading lesson workspace..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="px-4 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Lesson not found</h2>
        <p className="text-muted-foreground text-lg max-w-md">The lesson you are looking for does not exist in this course.</p>
        <Button variant="secondary" onClick={() => navigate(`/course/${courseId}`)} className="mt-8 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Course Overview
        </Button>
      </div>
    );
  }

  const hasContent = lesson.content?.length > 0;

  return (
    <LessonLayout
      isFocusMode={isFocusMode}
      course={course}
      courseId={courseId}
      lessonId={lessonId}
      lessonTitle={lesson.title}
      lessonContent={lesson.content}
      hasContent={hasContent}
      generating={generating}
      addingVideos={addingVideos}
      showChat={showChat}
      setShowChat={setShowChat}
      lessonScrollRef={lessonScrollRef}
      addVideos={addVideos}
      updateCurrentLesson={updateCurrentLesson}
      onNavigateBack={() => navigate(`/course/${courseId}`)}
      onSelectLesson={(id) => navigate(`/course/${courseId}/lesson/${id}`)}
    >
      <LessonHeader 
        courseId={courseId}
        course={course}
        lesson={lesson}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        isFocusMode={isFocusMode}
        setIsFocusMode={setIsFocusMode}
      />

      <LessonContent
        lesson={lesson}
        course={course}
        courseId={courseId}
        isFocusMode={isFocusMode}
        hasContent={hasContent}
        generating={generating}
        showDepthPicker={showDepthPicker}
        selectedLanguage={selectedLanguage}
        selectedDepth={selectedDepth}
        streamStatus={streamStatus}
        streamError={streamError}
        streamedCount={streamedCount}
        streamStage={streamStage}
        onGenerate={generateLesson}
        onLanguageChange={setSelectedLanguage}
        onPickerChange={setShowDepthPicker}
        onDepthChange={setSelectedDepth}
        updateCurrentLesson={updateCurrentLesson}
      />
    </LessonLayout>
  );
}
