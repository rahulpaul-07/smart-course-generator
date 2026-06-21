import { Lightbulb } from 'lucide-react';

export default function CalloutBlock({ block }) {
  return (
    <div className="my-7 flex gap-4 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-cyan-400/[0.04] p-5 shadow-lg shadow-indigo-950/10 backdrop-blur-sm">
      <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
        <Lightbulb className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        {block.title && (
          <p className="mb-1 font-display text-sm font-bold text-indigo-200">{block.title}</p>
        )}
        <p className="text-sm leading-7 text-slate-300">{block.text}</p>
      </div>
    </div>
  );
}
