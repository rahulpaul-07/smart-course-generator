import { Info, AlertTriangle, Lightbulb, CheckCircle2, FileCode2 } from 'lucide-react';
import React from 'react';
import type { LessonContentBlock } from '../../types';

export default function CalloutBlock({ block }: { block: LessonContentBlock }) {
  const type = (block.calloutType as string | undefined) || 'info'; // info, warning, tip, success, example
  
  const styles = {
    info: {
      container: 'border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-400/[0.02]',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      title: 'text-blue-500',
      icon: <Info className="h-5 w-5" />
    },
    warning: {
      container: 'border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-400/[0.02]',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      title: 'text-amber-500',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    tip: {
      container: 'border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 to-purple-400/[0.02]',
      iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500',
      title: 'text-fuchsia-500',
      icon: <Lightbulb className="h-5 w-5" />
    },
    success: {
      container: 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-400/[0.02]',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      title: 'text-emerald-500',
      icon: <CheckCircle2 className="h-5 w-5" />
    },
    example: {
      container: 'border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-indigo-400/[0.02]',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
      title: 'text-indigo-500',
      icon: <FileCode2 className="h-5 w-5" />
    }
  };

  const currentStyle = styles[type as keyof typeof styles] || styles.info;

  return (
    <div className={`my-8 flex gap-4 rounded-2xl border p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md ${currentStyle.container}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${currentStyle.iconBg}`}>
        {currentStyle.icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {typeof block.title === 'string' && block.title && (
          <h4 className={`mb-1.5 font-bold tracking-tight text-sm ${currentStyle.title}`}>{block.title}</h4>
        )}
        <div className="text-[15px] leading-relaxed text-foreground/90">
          {block.text as string}
        </div>
      </div>
    </div>
  );
}
