import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, LogOut, Map, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { path: '/', label: 'Courses', icon: BookOpen },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/roadmaps', label: 'Roadmaps', icon: Map },
  { path: '/interview-prep', label: 'Interview', icon: Brain },
  { path: '/agents', label: 'Agents', icon: Sparkles },
  { path: '/community', label: 'Community', icon: BookOpen },
  { path: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
];

export default function Navbar() {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function updateSearch(value) {
    setSearch(value);
    if (location.pathname === '/') {
      navigate(value.trim() ? `/?search=${encodeURIComponent(value.trim())}` : '/', {
        replace: true,
      });
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
  }

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#070916]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[96rem] items-center justify-between gap-4 px-4 lg:px-8">
        <button type="button" onClick={() => navigate('/')} className="group flex items-center gap-2.5 text-white">
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <BookOpen className="relative h-4 w-4" />
          </span>
          <span className="hidden font-display text-base font-bold tracking-tight sm:inline">Course<span className="text-brand-300">AI</span></span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-200 shadow-sm'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submitSearch} className="glass-card hidden w-56 items-center gap-2 rounded-xl px-3 py-2.5 transition focus-within:border-brand-400/50 focus-within:bg-slate-900/80 xl:flex">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search courses"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-brand-400/15 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-200 lg:flex">
            <Sparkles className="h-3.5 w-3.5" />
            AI learning studio
          </span>
          {user && (
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] py-1.5 pl-1.5 pr-3 sm:flex cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/profile')}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="max-w-28 truncate text-xs font-medium text-slate-300">{user.name}</span>
            </div>
          )}
          <button type="button" onClick={signOut} className="icon-button" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
