import { useId } from 'react';

// Flat, muted hues that hold white text on both themes. No violets: the
// brand is cobalt, and violet covers read as generic AI artwork.
const HUES = [214, 199, 173, 152, 28, 12, 350, 42];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(title: string) {
  const words = title.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2);
  return (words[0]?.[0] ?? title[0] ?? '?').toUpperCase() + (words[1]?.[0] ?? '').toUpperCase();
}

/**
 * Generated course artwork, used when a course has no AI banner. The card
 * previously fell back to a random picsum.photos stock photo: unrelated to the
 * course (a mountain for "Asynchronous JavaScript") and a third-party request
 * per card. This is deterministic per course, so a course always looks the same.
 */
export function CourseCover({ id, title, className }: { id: string; title: string; className?: string }) {
  const gid = useId();
  const n = hash(id || title);
  const hue = HUES[n % HUES.length];

  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <defs>
        <pattern id={`${gid}-p`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.18" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill={`hsl(${hue} 45% 32%)`} />
      <rect width="400" height="200" fill={`url(#${gid}-p)`} />
      <circle cx={300 + (n % 60)} cy={40 + (n % 50)} r="110" fill="white" fillOpacity="0.08" />
      <circle cx={60 + (n % 80)} cy={190} r="80" fill="black" fillOpacity="0.12" />
      <text x="28" y="168" fill="white" fillOpacity="0.92" fontFamily="Instrument Serif, Georgia, serif" fontStyle="italic" fontSize="84">
        {initials(title)}
      </text>
    </svg>
  );
}
