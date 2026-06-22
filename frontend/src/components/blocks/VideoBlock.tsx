function youtubeId(url) {
  const hostname = url.hostname.replace('www.', '');

  if (hostname === 'youtu.be') return url.pathname.slice(1);
  if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') return null;
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2];
  return url.searchParams.get('v');
}

export default function VideoBlock({ block }) {
  if (!block.url) return null;

  let url;
  try {
    url = new URL(block.url);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  let id = youtubeId(url);
  const isSearch = url.searchParams.get('listType') === 'search';
  const searchQuery = url.searchParams.get('list');
  const title = block.title || 'Lesson video';

  if (!id && !isSearch) {
    return (
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer"
        className="surface-card block p-5 text-brand-300 transition hover:border-brand-400/30 hover:text-white"
      >
        {title}
      </a>
    );
  }

  return (
    <div className="my-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#070914] shadow-2xl shadow-black/20">
      <iframe
        className="aspect-video w-full"
        src={isSearch ? `https://www.youtube.com/embed?listType=search&list=${searchQuery}` : `https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allowFullScreen
      />
      <p className="border-t border-white/[0.07] px-4 py-3 text-sm font-medium text-slate-300">{title}</p>
    </div>
  );
}
