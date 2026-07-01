export const SPEECH_LANGUAGES = [
  { label: 'English', code: 'en-US' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Spanish', code: 'es-ES' },
  { label: 'French', code: 'fr-FR' },
  { label: 'German', code: 'de-DE' },
  { label: 'Tamil', code: 'ta-IN' },
  { label: 'Telugu', code: 'te-IN' },
  { label: 'Bengali', code: 'bn-IN' },
  { label: 'Marathi', code: 'mr-IN' },
  { label: 'Kannada', code: 'kn-IN' },
  { label: 'Malayalam', code: 'ml-IN' },
  { label: 'Gujarati', code: 'gu-IN' },
  { label: 'Punjabi', code: 'pa-IN' },
  { label: 'Urdu', code: 'ur-PK' },
  { label: 'Nepali', code: 'ne-NP' },
  { label: 'Japanese', code: 'ja-JP' },
  { label: 'Korean', code: 'ko-KR' },
  { label: 'Mandarin Chinese', code: 'zh-CN' },
  { label: 'Arabic', code: 'ar-SA' },
  { label: 'Portuguese', code: 'pt-BR' },
  { label: 'Italian', code: 'it-IT' },
  { label: 'Russian', code: 'ru-RU' },
  { label: 'Thai', code: 'th-TH' },
  { label: 'Vietnamese', code: 'vi-VN' },
  { label: 'Indonesian', code: 'id-ID' },
  { label: 'Dutch', code: 'nl-NL' },
  { label: 'Turkish', code: 'tr-TR' },
  { label: 'Polish', code: 'pl-PL' },
];

const LANGUAGE_ALIASES = new Map<string, string>([
  ['chinese', 'zh-CN'],
  ['mandarin', 'zh-CN'],
  ['portuguese', 'pt-BR'],
  ...SPEECH_LANGUAGES.map(({ label, code }): [string, string] => [label.toLocaleLowerCase(), code]),
]);

function cleanText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function speechLanguageCode(language: unknown): string {
  const value = cleanText(language);
  if (/^[a-z]{2,3}(?:-[a-z]{2,4})?$/i.test(value)) return value;

  const normalized = value.toLocaleLowerCase();
  const exact = LANGUAGE_ALIASES.get(normalized);
  if (exact) return exact;

  const partial = [...LANGUAGE_ALIASES.entries()].find(([name]) => normalized.includes(name));
  return partial?.[1] || 'en-US';
}

export function matchingVoices(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice[] {
  const languageCode = speechLanguageCode(language).toLocaleLowerCase();
  const languageRoot = languageCode.split('-')[0];
  const matches = voices.filter((voice: SpeechSynthesisVoice) => voice.lang.toLocaleLowerCase().startsWith(languageRoot));

  return matches.sort((first, second) => {
    const firstScore = Number(first.lang.toLocaleLowerCase() === languageCode) * 4
      + Number(first.default) * 2
      + Number(first.localService);
    const secondScore = Number(second.lang.toLocaleLowerCase() === languageCode) * 4
      + Number(second.default) * 2
      + Number(second.localService);
    return secondScore - firstScore;
  });
}

export function extractNarration(lesson: { title?: string; content?: Array<Record<string, unknown>> } | null | undefined): string[] {
  const parts = [cleanText(lesson?.title)];

  for (const block of lesson?.content || []) {
    if (!block || typeof block !== 'object') continue;

    if (block.type === 'heading' || block.type === 'paragraph') {
      parts.push(cleanText(block.text));
    } else if (block.type === 'list') {
      parts.push(...(Array.isArray(block.items) ? block.items.map(cleanText) : []));
    } else if (block.type === 'callout') {
      parts.push(cleanText(block.title), cleanText(block.text));
    }
  }

  return parts.filter(Boolean);
}

export function splitForSpeech(value: unknown, maxLength = 240): string[] {
  const text = cleanText(value);
  if (!text) return [];

  const sentences = text.match(/[^.!?\u3002\uFF01\uFF1F]+[.!?\u3002\uFF01\uFF1F]+|[^.!?\u3002\uFF01\uFF1F]+$/gu) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const cleanSentence = cleanText(sentence);
    if (!cleanSentence) continue;

    if (cleanSentence.length > maxLength) {
      if (!cleanSentence.includes(' ')) {
        if (current) chunks.push(current);
        for (let start = 0; start < cleanSentence.length; start += maxLength) {
          chunks.push(cleanSentence.slice(start, start + maxLength));
        }
        current = '';
        continue;
      }

      const words = cleanSentence.split(' ');
      for (const word of words) {
        if (current && current.length + word.length + 1 > maxLength) {
          chunks.push(current);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
    } else if (current && current.length + cleanSentence.length + 1 > maxLength) {
      chunks.push(current);
      current = cleanSentence;
    } else {
      current = current ? `${current} ${cleanSentence}` : cleanSentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
