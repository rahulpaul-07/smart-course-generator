// backend/controllers/explanationsController.js

// Placeholder implementation for Hinglish explanation endpoints.
// In a real system this would call Gemini / Gemini APIs, but for the purpose of
// getting the frontend to stop receiving 404s we return mock data.

/**
 * Handles POST /explanations/hinglish-text
 * Expects { lessonText: string } in the body and returns a JSON payload with
 * a `hinglishText` field. For now we simply prepend a static prefix.
 */
exports.getHinglishText = (req, res) => {
  const { lessonText } = req.body || {};
  const hinglishText = lessonText
    ? `Hinglish: ${lessonText}`
    : 'Hinglish text not provided';
  res.json({ data: { hinglishText } });
};

/**
 * Handles POST /explanations/hinglish-audio
 * Expects { lessonText, voiceName, tone } in the body.
 * Returns a dummy audio WAV blob. To keep things simple we return an empty
 * Buffer and set a header `x-hinglish-text` with the same text.
 */
exports.getHinglishAudio = (req, res) => {
  const { lessonText } = req.body || {};
  // Echo back the hinglish text via header for the frontend to decode.
  if (lessonText) {
    res.setHeader('x-hinglish-text', encodeURIComponent(`Hinglish: ${lessonText}`));
  }
  // Send an empty WAV blob (44-byte header). This avoids streaming large data.
  const emptyWav = Buffer.from('RIFF$$$$WAVEfmt ', 'utf-8'); // minimal placeholder
  res.type('audio/wav').send(emptyWav);
};
