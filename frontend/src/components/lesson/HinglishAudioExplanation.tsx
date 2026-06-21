import { useEffect, useState } from "react";
import api from "../../utils/api";

function HinglishAudioExplanation({ lessonText, initialText = "" }) {
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

    try {
      setIsGenerating(true);
      setError("");
      setAudioUrl("");

      const textResponse = await api.post("/explanations/hinglish-text", {
        lessonText,
      });

      const translatedText = textResponse.data?.data?.hinglishText || "";
      setHinglishText(translatedText);

      const response = await api.post(
        "/explanations/hinglish-audio",
        {
          lessonText: translatedText || lessonText,
          voiceName: "Kore",
          tone: "friendly teacher",
        },
        {
          responseType: "blob",
        }
      );

      const encodedText = response.headers["x-hinglish-text"];

      if (encodedText) {
        setHinglishText(decodeURIComponent(encodedText));
      }

      const audioBlob = new Blob([response.data], {
        type: "audio/wav",
      });

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Hinglish text is ready. Add GEMINI_API_KEY to generate audio."
      );
    } finally {
      setIsGenerating(false);
    }
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

        <p className="mt-1 text-sm text-slate-600">
          Generate a friendly Hinglish audio explanation for this lesson.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGenerateAudio}
        disabled={isGenerating}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? "Preparing..." : "Generate Hinglish Explanation"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {hinglishText && (
        <div className="mt-4 rounded-lg bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">
            Hinglish Explanation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {hinglishText}
          </p>
        </div>
      )}

      {audioUrl && (
        <div className="mt-4 rounded-lg bg-white p-4">
          <audio controls src={audioUrl} className="w-full">
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
