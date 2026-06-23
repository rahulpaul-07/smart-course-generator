import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CodeSnippet({ block }: { block: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codeToCopy = block.code || (block.codes ? Object.values(block.codes).find(Boolean) : '');
    await navigator.clipboard.writeText(codeToCopy as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 overflow-hidden rounded-xl border border-border/50 bg-[#0d1117] shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-4 font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {block.language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="relative">
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-50">
          <code>{block.code || (block.codes ? Object.values(block.codes).find(Boolean) : '')}</code>
        </pre>
      </div>
    </motion.div>
  );
}
