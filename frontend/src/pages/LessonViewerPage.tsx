import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { LessonViewerSkeleton } from '../components/lesson/LessonViewerSkeleton';

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
    error,
    refetch,
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
    return <LessonViewerSkeleton />;
  }

  if (error || !lesson) {
    return (
      <LessonLayout
        isFocusMode={isFocusMode}
        course={course}
        courseId={courseId}
        lessonId={lessonId}
        lessonTitle={lesson?.title || 'Lesson'}
        lessonContent={[]}
        hasContent={false}
        generating={false}
        addingVideos={false}
        showChat={showChat}
        setShowChat={setShowChat}
        lessonScrollRef={lessonScrollRef}
        addVideos={() => {}}
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
        <div className="py-24 px-4 max-w-4xl mx-auto w-full">
          {error ? (
            <ErrorState
              title="Unable to load lesson"
              description="We couldn't load this lesson. Please try again."
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="Lesson not found"
              description="The lesson you are looking for does not exist in this course."
              action={
                <Button size="lg" className="rounded-xl shadow-sm" onClick={() => navigate(`/course/${courseId}`)}>
                  Back to Course Overview
                </Button>
              }
            />
          )}
        </div>
      </LessonLayout>
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
        lessonId={lessonId}
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
