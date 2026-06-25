import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import clsx from 'clsx';

export default function CodeSnippet({ block }: { block: any }) {
  const [copied, setCopied] = useState(false);

  const availableLanguages = block.codes
    ? Object.entries(block.codes)
        .filter(([_, code]) => Boolean(code))
        .map(([lang]) => lang)
    : [block.language || 'text'];

  const [selectedLang, setSelectedLang] = useState(availableLanguages[0] || 'text');

  const currentCode = (block.codes
    ? block.codes[selectedLang]
    : block.code || '') as string;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPrismLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'cpp' || l === 'c++') return 'cpp';
    if (l === 'python') return 'python';
    if (l === 'java') return 'java';
    if (l === 'js' || l === 'javascript') return 'javascript';
    if (l === 'ts' || l === 'typescript') return 'typescript';
    if (l === 'bash' || l === 'sh') return 'bash';
    if (l === 'html') return 'html';
    if (l === 'css') return 'css';
    if (l === 'json') return 'json';
    return 'javascript'; // Default fallback
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 overflow-hidden rounded-xl border border-border/50 bg-[#0d1117] shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 hidden sm:flex">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={clsx(
                  "px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-md transition-colors",
                  selectedLang === lang
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : "text-muted-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={clsx(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-xs font-medium",
            copied 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
              : "hover:bg-white/10 text-muted-foreground hover:text-foreground border border-transparent"
          )}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <Highlight
          theme={themes.vsDark}
          code={currentCode.trimEnd()}
          language={getPrismLanguage(selectedLang)}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={clsx(className, "overflow-x-auto p-4 py-5 text-[14px] leading-relaxed")}
              style={{ ...style, backgroundColor: 'transparent', margin: 0 }}
            >
              <div className="inline-block min-w-full">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line, key: i })} className="table-row">
                    <span className="table-cell select-none pr-5 text-right text-slate-600 font-mono text-[13px] w-[1%]">
                      {i + 1}
                    </span>
                    <span className="table-cell font-mono">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </pre>
          )}
        </Highlight>
      </div>
    </motion.div>
  );
}
