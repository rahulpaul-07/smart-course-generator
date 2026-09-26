import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { OpenPage } from './components/layout/PublicLayout';
import LoadingSpinner from './components/LoadingSpinner';

import ErrorBoundary from './components/ErrorBoundary';

const AppShell = lazy(() => import('./components/layout/AppShell').then((m) => ({ default: m.AppShell })));

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
// Only the landing page is in the entry chunk; everything a first-time
// visitor doesn't need (auth forms, Google OAuth, the app shell with its menus)
// loads on demand.
const LoginPage = withSuspense(lazy(() => import('./pages/LoginPage')));
const SignupPage = withSuspense(lazy(() => import('./pages/SignupPage')));
const OnboardingPage = withSuspense(lazy(() => import('./pages/OnboardingPage')));

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
const AiRouterPage = withSuspense(lazy(() => import('./pages/AiRouterPage')));
const EvalsPage = withSuspense(lazy(() => import('./pages/EvalsPage')));
const ProfilePage = withSuspense(lazy(() => import('./pages/ProfilePage')));
const PublicProfilePage = withSuspense(lazy(() => import('./pages/PublicProfilePage')));
const CommunityTemplatesPage = withSuspense(lazy(() => import('./pages/CommunityTemplatesPage')));
const LeaderboardPage = withSuspense(lazy(() => import('./pages/LeaderboardPage')));
const SettingsPage = withSuspense(lazy(() => import('./pages/SettingsPage')));
const CoursesPage = withSuspense(lazy(() => import('./pages/CoursesPage')));
const SaveAccountPage = withSuspense(lazy(() => import('./pages/SaveAccountPage')));
const PrivacyPage = withSuspense(lazy(() => import('./pages/PrivacyPage')));
const TermsPage = withSuspense(lazy(() => import('./pages/TermsPage')));
const NotFoundPage = withSuspense(lazy(() => import('./pages/NotFoundPage')));

/** Only same-app paths: "//evil.example" and absolute URLs would be an open redirect. */
function safeReturnPath(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Signed in: go back to the page that sent them to login, else the dashboard.
  // Otherwise render the public content immediately without blocking on auth.
  if (!loading && isAuthenticated) {
    const from = safeReturnPath((location.state as { from?: unknown } | null)?.from);
    return <Navigate to={from ?? '/dashboard'} replace />;
  }
  return <div key="content" className="w-full h-full">{children}</div>;
}

function DashboardPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner text="Loading..." /></div>}>
        <AppShell>{children}</AppShell>
      </Suspense>
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
            borderRadius: '14px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.35)',
            fontSize: '14px',
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
        {/* Transparency pages: public, and inside the shell when signed in. */}
        <Route path="/status" element={<OpenPage><AiRouterPage /></OpenPage>} />
        <Route path="/ai-router" element={<Navigate to="/status" replace />} />
        <Route path="/evals" element={<OpenPage><EvalsPage /></OpenPage>} />
        <Route path="/privacy" element={<OpenPage><PrivacyPage /></OpenPage>} />
        <Route path="/terms" element={<OpenPage><TermsPage /></OpenPage>} />
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
        <Route path="/profile/:userId" element={<OpenPage><PublicProfilePage /></OpenPage>} />
        <Route path="/community" element={<DashboardPage><CommunityTemplatesPage /></DashboardPage>} />
        <Route path="/leaderboard" element={<DashboardPage><LeaderboardPage /></DashboardPage>} />
        <Route path="/save-account" element={<DashboardPage><SaveAccountPage /></DashboardPage>} />
        <Route path="/settings" element={<DashboardPage><SettingsPage /></DashboardPage>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
