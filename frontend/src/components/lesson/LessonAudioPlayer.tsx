import {
  AudioLines,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  extractNarration,
  matchingVoices,
  speechLanguageCode,
  splitForSpeech,
} from '../../utils/speech';

export default function LessonAudioPlayer({ lesson }) {
  const language = lesson.language || 'English';
  const narration = useMemo(() => extractNarration(lesson), [lesson]);
  const [voices, setVoices] = useState([]);
  const [rate] = useState(1);
  const [status, setStatus] = useState('idle');
  const [currentChunk, setCurrentChunk] = useState(0);
  const playbackSession = useRef(0);

  const supported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window;

  const speechQueue = useMemo(
    () => narration.flatMap((chunk) => splitForSpeech(chunk)),
    [narration],
  );

  const languageVoices = useMemo(
    () => matchingVoices(voices, language),
    [language, voices],
  );

  const completedChunks = status === 'complete'
    ? speechQueue.length
    : currentChunk + Number(status === 'playing' || status === 'paused');
  const progress = speechQueue.length
    ? Math.round((completedChunks / speechQueue.length) * 100)
    : 0;

  useEffect(() => {
    if (!supported) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      playbackSession.current += 1;
      window.speechSynthesis.cancel();
      if (typeof window.speechSynthesis.removeEventListener === 'function') {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      } else if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [supported]);

  function stop(reset = true) {
    if (!supported) return;
    playbackSession.current += 1;
    window.speechSynthesis.cancel();
    setStatus('idle');
    if (reset) setCurrentChunk(0);
  }

  function speakAt(index, session) {
    if (!supported || session !== playbackSession.current) return;

    if (index >= speechQueue.length) {
      setCurrentChunk(speechQueue.length);
      setStatus('complete');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechQueue[index]);
    utterance.lang = speechLanguageCode(language);
    utterance.rate = rate;
    utterance.pitch = 1;

    const voice = languageVoices[0];
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (session !== playbackSession.current) return;
      setCurrentChunk(index);
      setStatus('playing');
    };
    utterance.onend = () => speakAt(index + 1, session);
    utterance.onerror = (event) => {
      if (session !== playbackSession.current || event.error === 'canceled' || event.error === 'interrupted') return;
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  function play() {
    if (!supported || !speechQueue.length) return;

    if (status === 'paused') {
      window.speechSynthesis.resume();
      setStatus('playing');
      return;
    }

    window.speechSynthesis.cancel();
    const session = playbackSession.current + 1;
    playbackSession.current = session;
    speakAt(status === 'complete' ? 0 : currentChunk, session);
  }

  function pause() {
    if (!supported || status !== 'playing') return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }

  if (!narration.length) return null;

  if (!supported) {
    return (
      <section className="surface-card mb-8 p-5 text-sm text-muted-foreground">
        Audio lessons are not supported by this browser. Open the lesson in a browser with speech synthesis support.
      </section>
    );
  }

  const noVoice = voices.length > 0 && !languageVoices.length;

  return (
    <section className="surface-card relative mb-8 overflow-hidden p-5 animate-enter-delay sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <AudioLines className={`h-5 w-5 ${status === 'playing' ? 'animate-pulse' : ''}`} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {status === 'playing' ? `Playing in ${language}` : `Listen in ${language}`}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'playing' ? (
            <button type="button" onClick={pause} className="btn-primary">
              <Pause className="h-4 w-4" />
              Pause
            </button>
          ) : (
            <button type="button" onClick={play} disabled={noVoice} className="btn-primary">
              <Play className="h-4 w-4" />
              {status === 'paused' ? 'Resume' : status === 'complete' ? 'Play again' : 'Listen'}
            </button>
          )}
          {status !== 'idle' && (
            <button type="button" onClick={() => stop()} className="icon-button" title="Stop audio">
              <Square className="h-3.5 w-3.5" />
            </button>
          )}
          {status !== 'idle' && status !== 'playing' && (
            <button type="button" onClick={() => stop()} className="icon-button" title="Reset">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-brand-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {noVoice && (
        <div className="relative mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
          <p className="text-sm font-medium text-amber-200">
            No {language} voice installed
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
            Your device does not have a {language} voice pack. To listen to this lesson, install a {language} text-to-speech voice in your device settings, then reload this page.
          </p>
        </div>
      )}
    </section>
  );
}
