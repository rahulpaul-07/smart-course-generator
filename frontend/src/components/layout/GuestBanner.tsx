import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/** Tells guest users their account is temporary and how to keep it. */
export function GuestBanner() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user?.isDemo || pathname === '/save-account') return null;

  return (
    <div className="flex items-center justify-center gap-x-3 gap-y-1 border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs sm:text-sm">
      <span className="inline-flex items-center gap-1.5 text-foreground/90">
        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
        <span className="sm:hidden">Guest account · deleted in 24h</span>
        <span className="hidden sm:inline">You are exploring with a guest account. It is deleted after 24 hours.</span>
      </span>
      <Link to="/save-account" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
        <span className="sm:hidden">Save</span>
        <span className="hidden sm:inline">Save your progress</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
