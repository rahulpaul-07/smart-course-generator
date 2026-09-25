import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

export const GITHUB_URL = 'https://github.com/rahulpaul-07/smart-course-generator';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#engineering', label: 'Engineering' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
      <nav
        aria-label="Main"
        className={cn(
          'mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-3 pl-4 transition-all duration-300',
          scrolled || open
            ? 'border-border/80 bg-background/70 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <Link to="/" className="rounded-lg text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source code on GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </a>
          <Link to="/login" className="hidden rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="mx-auto mt-2 max-w-5xl rounded-3xl border border-border/80 bg-background/90 p-2 backdrop-blur-xl md:hidden">
          {[...LINKS, { href: '/login', label: 'Sign in' }].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
