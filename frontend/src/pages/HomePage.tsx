import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Award, BarChart3, Bot, Brain, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import PromptForm from '../components/PromptForm';
import { courseService, type CourseGenerationStage } from '../services/courseService';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { DashboardContinueLearning } from '../components/dashboard/DashboardContinueLearning';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardActivity } from '../components/dashboard/DashboardActivity';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

/**
 * Generating a course is what this product does, so the generator is the top of
 * the page rather than a headline that scrolls down to one. The old order put a
 * marketing hero above it whose primary button did nothing but scroll 600px to
 * the form that is now simply here.
 *
 * `#course-generator` is linked from six other pages, so the anchor and its
 * scroll behaviour stay.
 */
const SHORTCUTS = [
  { label: 'Roadmaps', icon: Layers, url: '/roadmaps' },
  { label: 'Interview prep', icon: Brain, url: '/interview-prep' },
  { label: 'AI insights', icon: Bot, url: '/agents' },
  { label: 'Analytics', icon: BarChart3, url: '/analytics' },
  { label: 'Certificates', icon: Award, url: '/certificates' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<CourseGenerationStage | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  function showCourseReadyToast(courseId: string) {
    toast.success((t) => (
      <span className="flex items-center gap-3">
        Course ready
        <button
          type="button"
          onClick={() => { navigate(`/course/${courseId}`); toast.dismiss(t.id); }}
          className="font-semibold text-primary underline underline-offset-2"
        >
          View it
        </button>
      </span>
    ));
  }

  async function generateCourse(topic: string) {
    setGenerating(true);
    setGenerationError(null);
    setGenerationStage('analyzing_topic');

    const [data, err] = await courseService.generateCourseStream({ prompt: topic }, (stage) => {
      if (mountedRef.current) setGenerationStage(stage);
    });

    if (!mountedRef.current) {
      // The user already navigated away; don't yank them back with a hard
      // redirect. Let them opt in via the toast's click-through instead.
      if (data) showCourseReadyToast(data._id);
      return true;
    }

    setGenerating(false);
    setGenerationStage(null);

    if (data) {
      showCourseReadyToast(data._id);
      navigate(`/course/${data._id}`);
      return true;
    }

    setGenerationError(err || 'Failed to generate course');
    return false;
  }

  const { data, isLoading: loading, isError: error, refetch: fetchDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const [res, err] = await dashboardService.getSummary();
      if (err) throw new Error(err);
      return res;
    }
  });

  useEffect(() => {
    if (!loading && data && location.hash === '#course-generator') {
      document.getElementById('course-generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, data, location.hash]);

  const filteredRecentActivity = (data?.recentActivity || []).filter((activity) =>
    !searchQuery || activity.title.toLowerCase().includes(searchQuery)
  );

  const continueLearning =
    data?.continueLearning &&
    (!searchQuery || data.continueLearning.title.toLowerCase().includes(searchQuery))
      ? data.continueLearning
      : null;

  return (
    <PageContainer>
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState
          title="Unable to load dashboard"
          description="Please check your connection and try again."
          onRetry={fetchDashboard}
        />
      ) : !data || Object.keys(data).length === 0 ? (
        <EmptyState
          title="No Dashboard Data"
          description="Your dashboard is currently empty. Generate a course to get started!"
        />
      ) : (
        <div className="space-y-10">
          <DashboardHero
            name={user?.name || 'there'}
            streak={{
              current: data?.streak?.current || 0,
              longest: data?.streak?.longest || 0,
              lastActive: data?.streak?.lastActive,
            }}
            weeklyProgress={data?.progress?.weeklyProgress || 0}
          />

          <DashboardQuickActions actions={SHORTCUTS} />

          <section id="course-generator" className="scroll-mt-24">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Generate a course
            </h2>
            <PromptForm
              onSubmit={generateCourse}
              isLoading={generating}
              stage={generationStage}
              error={generationError}
              onDismissError={() => setGenerationError(null)}
            />
          </section>

          {continueLearning && <DashboardContinueLearning data={continueLearning} />}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <DashboardOverview
              statistics={data?.statistics}
              weeklyProgress={data?.progress?.weeklyProgress || 0}
              overallCompletion={data?.progress?.overallCompletion || 0}
            />
            <DashboardActivity recentActivity={filteredRecentActivity} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
