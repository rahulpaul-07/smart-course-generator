const KeyManager = require("./keyManager");
const youtubeKeys = new KeyManager("YOUTUBE_API_KEY");

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const LANGUAGE_CODES = {
  "English": "en", "Spanish": "es", "French": "fr", "German": "de", 
  "Hindi": "hi", "Bengali": "bn", "Mandarin": "zh", "Japanese": "ja", 
  "Arabic": "ar", "Portuguese": "pt", "Russian": "ru", "Korean": "ko",
  "Telugu": "te", "Marathi": "mr", "Tamil": "ta", "Urdu": "ur", 
  "Gujarati": "gu", "Kannada": "kn", "Odia": "or", "Malayalam": "ml", 
  "Punjabi": "pa", "Assamese": "as"
};

async function findLessonVideos({ lesson, moduleDoc, course, heading }) {
  const language = course?.language || "English";
  const langCode = LANGUAGE_CODES[language] || "en";
  const query = heading 
    ? `${course?.title || ""} ${heading} tutorial` 
    : `${course?.title || ""} ${lesson.title} tutorial`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const apiKey = youtubeKeys.getKey();
    if (!apiKey) {
      const error = new Error("server error");
      error.statusCode = 500;
      throw error;
    }

    const params = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      safeSearch: "moderate",
      maxResults: "10",
      relevanceLanguage: langCode,
      q: query,
    });

    let response;
    try {
      response = await fetch(`${SEARCH_URL}?${params}`, {
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      const error = new Error("Could not reach YouTube. Please try again.");
      error.statusCode = 502;
      throw error;
    }

    if (!response.ok) {
      if (response.status === 403) {
        youtubeKeys.markExhausted(apiKey);
        console.warn(`[YouTube] Key exhausted or quota exceeded. Retrying with a new key...`);
        continue; // Try the next key
      }
      const error = new Error("YouTube video search failed.");
      error.statusCode = 502;
      throw error;
    }

    const data = await response.json();
    const existingUrls = new Set((lesson.content || []).map((block) => block.url).filter(Boolean));
    const videos = [];

    for (const item of data.items || []) {
      const videoId = item.id?.videoId;
      const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

      if (!url || existingUrls.has(url)) continue;

      videos.push({
        type: "video",
        url,
        title: item.snippet?.title || query,
      });

      if (videos.length >= 1) {
        return videos;
      }
    }

    if (!videos.length) {
      const error = new Error("No new relevant videos were found for this lesson.");
      error.statusCode = 409;
      throw error;
    }
  }

  // If we exhaust attempts and still haven't returned:
  const error = new Error("YouTube video search failed after multiple attempts due to quota limits.");
  error.statusCode = 502;
  throw error;
}

module.exports = { findLessonVideos };
