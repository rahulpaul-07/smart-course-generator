import { Info, AlertTriangle, Lightbulb, CheckCircle2, FileCode2 } from 'lucide-react';
import React from 'react';
import type { LessonContentBlock } from '../../types';

export default function CalloutBlock({ block }: { block: LessonContentBlock }) {
  const type = (block.calloutType as string | undefined) || 'info'; // info, warning, tip, success, example
  
  const styles = {
    info: {
      container: 'border-primary/20 bg-gradient-to-br from-primary/10 to-primary/[0.02]',
      iconBg: 'bg-primary/10 border-primary/20 text-primary',
      title: 'text-primary',
      icon: <Info className="h-5 w-5" />
    },
    warning: {
      container: 'border-warning/20 bg-gradient-to-br from-warning/10 to-warning/[0.02]',
      iconBg: 'bg-warning/10 border-warning/20 text-warning',
      title: 'text-warning',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    tip: {
      container: 'border-primary/20 bg-gradient-to-br from-primary/10 to-primary/[0.02]',
      iconBg: 'bg-primary/10 border-primary/20 text-primary',
      title: 'text-primary',
      icon: <Lightbulb className="h-5 w-5" />
    },
    success: {
      container: 'border-success/20 bg-gradient-to-br from-success/10 to-success/[0.02]',
      iconBg: 'bg-success/10 border-success/20 text-success',
      title: 'text-success',
      icon: <CheckCircle2 className="h-5 w-5" />
    },
    example: {
      container: 'border-success/20 bg-gradient-to-br from-success/10 to-success/[0.02]',
      iconBg: 'bg-success/10 border-success/20 text-success',
      title: 'text-success',
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
