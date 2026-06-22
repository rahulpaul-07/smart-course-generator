// backend/controllers/explanationsController.js

const aiRouter = require('../services/aiRouter');
const googleTTS = require('google-tts-api');

exports.getHinglishText = async (req, res) => {
  try {
    const { lessonText } = req.body || {};
    if (!lessonText) {
      return res.status(400).json({ error: 'lessonText is required' });
    }

    const systemPrompt = `You are an expert bilingual teacher. Translate the following educational text into friendly, easy-to-understand Hinglish (a blend of Hindi and English written in the Latin alphabet). Keep it professional but accessible.`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: lessonText }
    ];

    const hinglishText = await aiRouter.generateText(messages, 2048);
    res.json({ data: { hinglishText } });
  } catch (err) {
    console.error("Hinglish text generation error:", err);
    res.status(500).json({ error: "Failed to generate Hinglish text" });
  }
};

exports.getHinglishAudio = async (req, res) => {
  try {
    const { lessonText } = req.body || {};
    if (!lessonText) {
      return res.status(400).json({ error: 'lessonText is required' });
    }

    // Echo back the hinglish text via header for the frontend to decode.
    res.setHeader('x-hinglish-text', encodeURIComponent(lessonText));

    // Limit text length for TTS (Google TTS limit is 200 chars per request, but the module handles splitting or we can just fetch the first part)
    // google-tts-api `getAllAudioBase64` handles long text (>200 chars).
    const results = await googleTTS.getAllAudioBase64(lessonText, {
      lang: 'hi',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?'
    });

    // results is an array of objects { shortText, base64 }
    // We need to concatenate all base64 chunks into one audio buffer
    const buffers = results.map(r => Buffer.from(r.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);

    res.type('audio/mp3').send(finalBuffer);
  } catch (err) {
    console.error("Hinglish audio generation error:", err);
    // Send empty mp3 on fail to prevent frontend crashing
    const emptyWav = Buffer.from('RIFF$$$$WAVEfmt ', 'utf-8'); 
    res.type('audio/wav').send(emptyWav);
  }
};
