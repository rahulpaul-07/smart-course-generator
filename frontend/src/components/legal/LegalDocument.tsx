import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const LEGAL_UPDATED = '26 September 2026';
export const CONTACT_EMAIL = 'paulrahulami@gmail.com';

/** Shared frame for the privacy policy and terms: one readable column. */
export function LegalDocument({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | CourseAI`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{intro}</p>
      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-h2:mt-10 prose-h2:text-xl prose-h2:font-semibold prose-h2:tracking-tight prose-a:text-primary">
        {children}
      </div>
      <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        See also the <Link to="/privacy" className="text-foreground underline underline-offset-4">privacy policy</Link> and{' '}
        <Link to="/terms" className="text-foreground underline underline-offset-4">terms of use</Link>.
      </p>
    </article>
  );
}
