import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import LoadingSpinner from './components/LoadingSpinner';

import ErrorBoundary from './components/ErrorBoundary';

const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  return function SuspensedComponent(props: P) {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner text="Loading..." /></div>}>
        <Component {...props} />
      </Suspense>
    );
  };
};

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import FlashcardTestPage from './pages/FlashcardTestPage';

const CertificatePage = withSuspense(lazy(() => import('./pages/CertificatePage')));
const CertificatesPage = withSuspense(lazy(() => import('./pages/CertificatesPage')));
const CourseOverviewPage = withSuspense(lazy(() => import('./pages/CourseOverviewPage')));
const HomePage = withSuspense(lazy(() => import('./pages/HomePage')));
const LessonViewerPage = withSuspense(lazy(() => import('./pages/LessonViewerPage')));
const SharedCoursePage = withSuspense(lazy(() => import('./pages/SharedCoursePage')));
const FinalTestPage = withSuspense(lazy(() => import('./pages/FinalTestPage')));
const AnalyticsPage = withSuspense(lazy(() => import('./pages/AnalyticsPage')));
const RoadmapPage = withSuspense(lazy(() => import('./pages/RoadmapPage')));
const InterviewPrepPage = withSuspense(lazy(() => import('./pages/InterviewPrepPage')));
const AiAgentsPage = withSuspense(lazy(() => import('./pages/AiAgentsPage')));
const ProfilePage = withSuspense(lazy(() => import('./pages/ProfilePage')));
const PublicProfilePage = withSuspense(lazy(() => import('./pages/PublicProfilePage')));
const CommunityTemplatesPage = withSuspense(lazy(() => import('./pages/CommunityTemplatesPage')));
const LeaderboardPage = withSuspense(lazy(() => import('./pages/LeaderboardPage')));
const SettingsPage = withSuspense(lazy(() => import('./pages/SettingsPage')));
const CoursesPage = withSuspense(lazy(() => import('./pages/CoursesPage')));
const NotFoundPage = withSuspense(lazy(() => import('./pages/NotFoundPage')));

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // If we know the user is authenticated, redirect to dashboard.
  // Otherwise, render the public content immediately without blocking for auth to load.
  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <div key="content" className="w-full h-full">{children}</div>;
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
            background: 'hsl(var(--card) / 0.9)',
            border: '1px solid hsl(var(--border) / 0.5)',
            borderRadius: '16px', // rounded-2xl
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
            color: 'hsl(var(--foreground))',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/share/:shareId" element={<SharedCoursePage />} />
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        
        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<DashboardPage><HomePage /></DashboardPage>} />
        <Route path="/courses" element={<DashboardPage><CoursesPage /></DashboardPage>} />
        <Route path="/course/:id" element={<DashboardPage><CourseOverviewPage /></DashboardPage>} />
        <Route path="/course/:id/certificate" element={<DashboardPage><CertificatePage /></DashboardPage>} />
        <Route path="/certificate/:id" element={<CertificatePage />} />
        <Route path="/certificates" element={<DashboardPage><CertificatesPage /></DashboardPage>} />
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
        <Route path="/flashcard-test" element={<FlashcardTestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
