import type { LessonContentBlock } from '../../types';

function youtubeId(url: URL) {
  const hostname = url.hostname.replace('www.', '');

  if (hostname === 'youtu.be') return url.pathname.slice(1);
  if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') return null;
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2];
  return url.searchParams.get('v');
}

export default function VideoBlock({ block }: { block: LessonContentBlock & { url?: string; title?: string } }) {
  if (!block.url) return null;

  let url;
  try {
    url = new URL(block.url);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const id = youtubeId(url);
  const isSearch = url.searchParams.get('listType') === 'search';
  const searchQuery = url.searchParams.get('list');
  const title = block.title || 'Lesson video';

  if (!id && !isSearch) {
    return (
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer"
        className="block p-5 rounded-xl border border-border/50 bg-card/50 shadow-sm text-primary transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="font-medium">{title}</span>
        </span>
      </a>
    );
  }

  return (
    <div className="group relative my-8 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      <div className="relative z-10">
        <iframe
          className="aspect-video w-full"
          src={isSearch ? `https://www.youtube.com/embed?listType=search&list=${searchQuery}` : `https://www.youtube.com/embed/${id}`}
          title={title}
          loading="lazy"
          allowFullScreen
        />
        <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-muted/20 px-5 py-3 backdrop-blur-sm">
          <p className="min-w-0 text-sm font-semibold text-foreground/90 line-clamp-1 flex items-center gap-2">
            <svg className="h-4 w-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            {title}
          </p>
          {/* Always-available escape hatch: some videos have embedding disabled
              by their owner, which shows an error inside the iframe with no
              way for our code to detect or work around it. */}
          <a
            href={url.href}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Watch on YouTube ↗
          </a>
        </div>
      </div>
    </div>
  );
}
