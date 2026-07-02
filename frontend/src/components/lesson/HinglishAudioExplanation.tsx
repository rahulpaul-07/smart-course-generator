import { useEffect, useState } from "react";
import { lessonService } from "../../services/lessonService";
import { Button } from "@/components/ui/button";

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
    <section className="mt-8 rounded-lg border border-border/30 bg-card/60 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Accessibility
        </p>

        <h3 className="text-xl font-bold text-foreground">
          Hinglish Audio Explanation
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Generate a friendly Hinglish audio explanation for this lesson.
        </p>
      </div>

      <Button
        type="button"
        onClick={handleGenerateAudio}
        disabled={isGenerating}
      >
        {isGenerating ? "Preparing..." : "Generate Hinglish Explanation"}
      </Button>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {hinglishText && (
        <div className="mt-4 rounded-lg bg-card p-4">
          <p className="text-sm font-semibold text-foreground">
            Hinglish Explanation
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
            className="mt-3 inline-block text-sm font-semibold text-primary hover:text-primary/80"
          >
            Download audio
          </a>
        </div>
      )}
    </section>
  );
}

export default HinglishAudioExplanation;
