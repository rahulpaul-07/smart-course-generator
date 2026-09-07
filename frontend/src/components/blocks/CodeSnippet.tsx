import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import clsx from 'clsx';
import { useClipboard } from '../../hooks/useClipboard';
import type { LessonContentBlock } from '../../types';

export default function CodeSnippet({ block }: { block: LessonContentBlock }) {
  const { hasCopied, copyToClipboard } = useClipboard({ successMessage: '' });

  const codes = block.codes as Record<string, string> | undefined;

  const availableLanguages = codes
    ? Object.entries(codes)
        .filter(([, code]) => Boolean(code))
        .map(([lang]) => lang)
    : [(block.language as string | undefined) || 'text'];

  const [selectedLang, setSelectedLang] = useState(availableLanguages[0] || 'text');

  const currentCode = (codes
    ? codes[selectedLang]
    : (block.code as string | undefined) || '') as string;

  const handleCopy = () => {
    copyToClipboard(currentCode);
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
      className="my-8 overflow-hidden rounded-xl border border-border/30 bg-[#0d1117] shadow-md"
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="hidden gap-1.5 sm:flex">
            <div className="h-3 w-3 rounded-full bg-destructive/80" />
            <div className="h-3 w-3 rounded-full bg-warning/80" />
            <div className="h-3 w-3 rounded-full bg-success/80" />
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
                    : "text-muted-foreground hover:bg-foreground/10 border border-transparent"
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
            hasCopied 
              ? "bg-success/20 text-success border border-success/30" 
              : "hover:bg-foreground/10 text-muted-foreground hover:text-foreground border border-transparent"
          )}
          title="Copy code"
        >
          {hasCopied ? (
            <>
              <Check size={14} className="text-success" />
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
                {tokens.map((line, i) => {
                  // `key` must not go through getLineProps/getTokenProps: those
                  // return it inside the props object, and spreading a `key`
                  // into JSX is a React warning. The className they return also
                  // has to be merged rather than overwritten -- the explicit
                  // className used to replace Prism's token classes, which is
                  // what actually carries the syntax colouring.
                  const { className: lineClass, ...lineProps } = getLineProps({ line });
                  return (
                    <div key={i} {...lineProps} className={clsx(lineClass, 'table-row')}>
                      <span className="table-cell select-none pr-5 text-right text-muted-foreground font-mono text-[13px] w-[1%]">
                        {i + 1}
                      </span>
                      <span className="table-cell font-mono">
                        {line.map((token, tokenIndex) => {
                          const { className: tokenClass, ...tokenProps } = getTokenProps({ token });
                          return (
                            <span key={tokenIndex} {...tokenProps} className={tokenClass} />
                          );
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </pre>
          )}
        </Highlight>
      </div>
    </motion.div>
  );
}
