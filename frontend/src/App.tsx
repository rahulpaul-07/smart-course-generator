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
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
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
      <Routes>
        <Route path="/login" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><GuestRoute><LoginPage /></GuestRoute></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><GuestRoute><SignupPage /></GuestRoute></Suspense>} />
        <Route path="/share/:shareId" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><SharedCoursePage /></Suspense>} />
        <Route path="/" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><GuestRoute><LandingPage /></GuestRoute></Suspense>} />
        
        {/* Protected Routes */}
        <Route path="/onboarding" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><ProtectedRoute><OnboardingPage /></ProtectedRoute></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><HomePage /></DashboardPage></Suspense>} />
        <Route path="/course/:id" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><CourseOverviewPage /></DashboardPage></Suspense>} />
        <Route path="/course/:id/certificate" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><CertificatePage /></DashboardPage></Suspense>} />
        <Route path="/certificate/:id" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><CertificatePage /></Suspense>} />
        <Route path="/course/:id/test" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><FinalTestPage /></DashboardPage></Suspense>} />
        <Route
          path="/course/:courseId/lesson/:id"
          element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><LessonViewerPage /></DashboardPage></Suspense>}
        />
        <Route path="/analytics" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><AnalyticsPage /></DashboardPage></Suspense>} />
        <Route path="/roadmaps" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><RoadmapPage /></DashboardPage></Suspense>} />
        <Route path="/interview-prep" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><InterviewPrepPage /></DashboardPage></Suspense>} />
        <Route path="/agents" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><AiAgentsPage /></DashboardPage></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><ProfilePage /></DashboardPage></Suspense>} />
        <Route path="/profile/:userId" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><PublicProfilePage /></DashboardPage></Suspense>} />
        <Route path="/community" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><CommunityTemplatesPage /></DashboardPage></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><LeaderboardPage /></DashboardPage></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<LoadingSpinner text="Loading..." />}><DashboardPage><SettingsPage /></DashboardPage></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
