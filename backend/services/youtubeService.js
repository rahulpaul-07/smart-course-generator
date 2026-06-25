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

function parseIsoDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

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
        const existingUrls = new Set((lesson.videos || []).map((v) => v.url).filter(Boolean));
        // Filter out shorts (<120s) and duplicates
        const filtered = results.videos.filter(v => v.seconds >= 120 && !existingUrls.has(v.url));
        
        return filtered.slice(0, 3).map(video => ({
          title: video.title || `${query} Tutorial`,
          url: video.url,
          thumbnail: video.image || video.thumbnail,
          duration: video.seconds,
          channel: video.author?.name || "YouTube"
        }));
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

    const searchParams = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      safeSearch: "moderate",
      maxResults: "10",
      relevanceLanguage: langCode,
      q: query,
    });

    let searchResponse;
    try {
      searchResponse = await fetch(`${SEARCH_URL}?${searchParams}`, {
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      continue;
    }

    if (!searchResponse.ok) {
      if (searchResponse.status === 403) {
        youtubeKeys.markExhausted(apiKey);
        console.warn(`[YouTube] Key exhausted or quota exceeded. Retrying with a new key...`);
        continue;
      }
      continue;
    }

    const searchData = await searchResponse.json();
    const videoIds = (searchData.items || []).map(item => item.id?.videoId).filter(Boolean);
    
    if (videoIds.length === 0) break;

    // Fetch details to get duration
    const videosParams = new URLSearchParams({
      key: apiKey,
      part: "contentDetails,snippet",
      id: videoIds.join(",")
    });

    let videosResponse;
    try {
      videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${videosParams}`, {
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      continue;
    }

    if (!videosResponse.ok) continue;

    const videosData = await videosResponse.json();
    const existingUrls = new Set((lesson.videos || []).map((v) => v.url).filter(Boolean));
    const videos = [];

    for (const item of videosData.items || []) {
      const durationSeconds = parseIsoDuration(item.contentDetails?.duration || "");
      const url = `https://www.youtube.com/watch?v=${item.id}`;
      const title = item.snippet?.title || "";

      // Filter: > 2 mins, no duplicate URLs, not a live broadcast
      if (
        durationSeconds >= 120 && 
        !existingUrls.has(url) && 
        item.snippet?.liveBroadcastContent === "none"
      ) {
        videos.push({
          title,
          url,
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
          duration: durationSeconds,
          channel: item.snippet?.channelTitle || "YouTube"
        });
      }

      if (videos.length >= 3) {
        return videos;
      }
    }

    if (videos.length > 0) return videos;
    break; // No suitable videos, fallback
  }

  const fallbackVideos = await fallbackSearch();
  if (fallbackVideos.length > 0) return fallbackVideos;

  return []; // Never throw an error, just return empty!
}

module.exports = { findLessonVideos };
