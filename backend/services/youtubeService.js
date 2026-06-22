const ytSearch = require("yt-search");
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

  const fallbackSearch = async () => {
    try {
      const results = await ytSearch(query);
      if (results && results.videos && results.videos.length > 0) {
        const video = results.videos[0];
        return [{
          type: "video",
          url: video.url,
          title: video.title || `${query} Tutorial`
        }];
      }
    } catch (e) {
      console.warn("yt-search fallback failed:", e);
    }
    return [];
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const apiKey = youtubeKeys.getKey();
    if (!apiKey) {
      return await fallbackSearch();
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
      continue; // Try next key or move to fallback
    }

    if (!response.ok) {
      if (response.status === 403) {
        youtubeKeys.markExhausted(apiKey);
        console.warn(`[YouTube] Key exhausted or quota exceeded. Retrying with a new key...`);
        continue;
      }
      continue; // If 400/500, skip to next or fallback
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
      // No relevant videos found via API, fallback to ytSearch
      break;
    }
  }

  // If we exhaust attempts or break due to no videos:
  const fallbackVideos = await fallbackSearch();
  if (fallbackVideos.length > 0) return fallbackVideos;

  const error = new Error("YouTube video search failed after multiple attempts.");
  error.statusCode = 502;
  throw error;
}

module.exports = { findLessonVideos };
