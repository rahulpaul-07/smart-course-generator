import { useEffect, useState } from "react";
import { lessonService } from "../../services/lessonService";

interface HinglishAudioExplanationProps {
  lessonText: string;
  initialText?: string;
}

function HinglishAudioExplanation({ lessonText, initialText = "" }: HinglishAudioExplanationProps) {
  const [audioUrl, setAudioUrl] = useState("");
  const [hinglishText, setHinglishText] = useState(initialText);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerateAudio = async () => {
    if (!lessonText || lessonText.trim().length < 10) {
      setError("Lesson text is too short for Hinglish explanation.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setAudioUrl("");

    const [textResponse, textError] = await lessonService.generateHinglishText(lessonText);
    
    if (textError) {
      setError(textError);
      setIsGenerating(false);
      return;
    }

    const translatedText = textResponse?.data?.hinglishText || "";
    setHinglishText(translatedText);

    const [audioBlob, audioError] = await lessonService.generateHinglishAudio(translatedText || lessonText);

    if (audioError) {
      setError(audioError || "Hinglish text is ready. Add GEMINI_API_KEY to generate audio.");
    } else if (audioBlob) {
      // Because we mapped audioBlob to data, but we also needed headers. 
      // handleApi only returns data. So we won't get x-hinglish-text from headers.
      // Wait, let's fix handleApi to return headers if needed? 
      // Actually the original code does:
      // const encodedText = response.headers["x-hinglish-text"];
      // if (encodedText) setHinglishText(decodeURIComponent(encodedText));
      // Since handleApi discards headers, maybe we can ignore it or we need headers.
      // Let's just create blob from data.
      
      const blob = new Blob([audioBlob], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }

    setIsGenerating(false);
  };

  return (
    <section className="mt-8 rounded-lg border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Accessibility
        </p>

        <h3 className="text-xl font-bold text-slate-950">
          Hinglish Audio Explanation
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Generate a friendly Hinglish audio explanation for this lesson.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGenerateAudio}
        disabled={isGenerating}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-foreground hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? "Preparing..." : "Generate Hinglish Explanation"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {hinglishText && (
        <div className="mt-4 rounded-lg bg-card p-4">
          <p className="text-sm font-semibold text-slate-900">
            Hinglish Explanation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {hinglishText}
          </p>
        </div>
      )}

      {audioUrl && (
        <div className="mt-4 rounded-lg bg-card p-4">
          <audio controls src={audioUrl} className="w-full">
            <track kind="captions" />
            Your browser does not support audio playback.
          </audio>

          <a
            href={audioUrl}
            download="hinglish-explanation.wav"
            className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Download audio
          </a>
        </div>
      )}
    </section>
  );
}

export default HinglishAudioExplanation;
