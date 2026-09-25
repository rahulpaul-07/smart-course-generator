import { lazy, Suspense, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const AppShell = lazy(() => import('./AppShell').then((m) => ({ default: m.AppShell })));

function PublicLayout({ children }: { children: ReactNode }) {
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-full px-3 py-1.5 text-sm transition-colors', isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-[15px]"><Logo /></Link>
          <nav aria-label="Transparency" className="hidden items-center gap-1 sm:flex">
            <NavLink to="/status" className={tab}>Router status</NavLink>
            <NavLink to="/evals" className={tab}>Evals</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link to="/signup" className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">Get started</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

/**
 * Pages that are useful to anyone (router health, eval scorecard): inside the
 * app shell for signed-in users, in a minimal public frame for everyone else.
 */
export function OpenPage({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <PublicLayout>{children}</PublicLayout>;
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
