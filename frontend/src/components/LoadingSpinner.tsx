import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', small = false, size = 'default' }) {
  const isSmall = small || size === 'sm';

  if (isSmall) {
    return <Loader2 className="h-4 w-4 animate-spin text-current" />;
  }

  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 p-12 text-slate-400">
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-brand-400/20 bg-brand-500/10 shadow-lg shadow-brand-950/20">
        <Loader2 className="h-5 w-5 animate-spin text-brand-300" />
      </span>
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
