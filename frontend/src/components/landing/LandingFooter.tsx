import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { GITHUB_URL } from './LandingNav';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Transparency',
    links: [
      { label: 'AI router status', to: '/status' },
      { label: 'Eval results', to: '/evals' },
      { label: 'Architecture docs', href: `${GITHUB_URL}/tree/main/docs` },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'Source code', href: GITHUB_URL },
      { label: 'Changelog', href: `${GITHUB_URL}/blob/main/CHANGELOG.md` },
      { label: 'Security policy', href: `${GITHUB_URL}/blob/main/SECURITY.md` },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Structured courses from a single prompt. An open-source project by Rahul Paul, MIT licensed.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-medium">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  {'to' in l && l.to ? (
                    <Link to={l.to} className="transition-colors hover:text-foreground">{l.label}</Link>
                  ) : (
                    <a
                      href={l.href}
                      className="transition-colors hover:text-foreground"
                      {...(l.href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} CourseAI</p>
        <p>AI-generated content can be wrong. Verify anything important.</p>
      </div>
    </footer>
  );
}
