/**
 * Minimal ambient typings for the (still non-standard) Web Speech API.
 * Not part of lib.dom.d.ts, so we declare just what the app uses.
 */
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string | null;
    [key: string]: unknown;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;

  export default html2canvas;
}

/**
 * @types/react-syntax-highlighter@15 only ships declarations for the
 * `languages/hljs/*` submodules, not `languages/prism/*` -- even though the
 * app (and this DefinitelyTyped package itself) uses the Prism-flavored
 * theme (`vscDarkPlus`). Without this, importing individual Prism languages
 * for the lightweight `prism-light` build (see src/lib/syntaxHighlighter.ts)
 * fails to typecheck even though it works fine at runtime.
 */
declare module "react-syntax-highlighter/dist/esm/languages/prism/*" {
  const language: unknown;
  export default language;
}
