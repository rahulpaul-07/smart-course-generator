import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import LoadingSpinner from './components/LoadingSpinner';

import ErrorBoundary from './components/ErrorBoundary';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const CourseOverviewPage = lazy(() => import('./pages/CourseOverviewPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LessonViewerPage = lazy(() => import('./pages/LessonViewerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SharedCoursePage = lazy(() => import('./pages/SharedCoursePage'));
const FinalTestPage = lazy(() => import('./pages/FinalTestPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage'));
const AiAgentsPage = lazy(() => import('./pages/AiAgentsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const CommunityTemplatesPage = lazy(() => import('./pages/CommunityTemplatesPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardPage({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      {user && !user.onboardingCompleted && window.location.pathname !== '/onboarding' ? (
        <Navigate to="/onboarding" replace />
      ) : (
        <AppShell>{children}</AppShell>
      )}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 20, 38, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            borderRadius: '14px',
            boxShadow: '0 18px 50px rgba(0, 0, 0, 0.35)',
            color: '#e2e8f0',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner text="Opening your learning space..." />}>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/share/:shareId" element={<SharedCoursePage />} />
          <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<DashboardPage><HomePage /></DashboardPage>} />
          <Route path="/course/:id" element={<DashboardPage><CourseOverviewPage /></DashboardPage>} />
          <Route path="/course/:id/certificate" element={<DashboardPage><CertificatePage /></DashboardPage>} />
          <Route path="/certificate/:id" element={<CertificatePage />} />
          <Route path="/course/:id/test" element={<DashboardPage><FinalTestPage /></DashboardPage>} />
          <Route
            path="/course/:courseId/lesson/:id"
            element={<DashboardPage><LessonViewerPage /></DashboardPage>}
          />
          <Route path="/analytics" element={<DashboardPage><AnalyticsPage /></DashboardPage>} />
          <Route path="/roadmaps" element={<DashboardPage><RoadmapPage /></DashboardPage>} />
          <Route path="/interview-prep" element={<DashboardPage><InterviewPrepPage /></DashboardPage>} />
          <Route path="/agents" element={<DashboardPage><AiAgentsPage /></DashboardPage>} />
          <Route path="/profile" element={<DashboardPage><ProfilePage /></DashboardPage>} />
          <Route path="/profile/:userId" element={<DashboardPage><PublicProfilePage /></DashboardPage>} />
          <Route path="/community" element={<DashboardPage><CommunityTemplatesPage /></DashboardPage>} />
          <Route path="/leaderboard" element={<DashboardPage><LeaderboardPage /></DashboardPage>} />
          <Route path="/settings" element={<DashboardPage><SettingsPage /></DashboardPage>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
