const { GoogleGenAI } = require("@google/genai");

const KeyManager = require("./keyManager");
const geminiKeys = new KeyManager("GEMINI_API_KEY");

function getAiClient() {
  const apiKey = geminiKeys.getKey();
  return { client: new GoogleGenAI({ apiKey }), apiKey };
}

const { parseRobustJson, structuredAiLog } = require("./aiValidator");
function geminiError(error) {
  let message = "AI service is unavailable. Please try again.";
  let statusCode = 502;

  if (error.status === 429) {
    message = "AI rate limit reached. Please wait a few seconds and try again.";
    statusCode = 429;
  } else {
    console.error("Gemini API Error:", error.message || error);
    if (error.message) {
      try {
        // Extract inner message if Gemini wraps it in JSON
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        } else {
          message = error.message;
        }
      } catch {
        message = error.message;
      }
    }
  }

  const serviceError = new Error(message);
  serviceError.statusCode = statusCode;
  return serviceError;
}

async function generateJson(systemPrompt, userPrompt, maxTokens = 4096, modelName = "gemini-1.5-flash") {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { client, apiKey } = getAiClient();
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: maxTokens,
        }
      });
      return parseRobustJson(response.text || "");
    } catch (error) {
      if (error.status === 429) geminiKeys.markExhausted(apiKey);
      console.error("Generate JSON Error", error);
      if (attempt === 1) throw geminiError(error);
    }
  }

  const error = new Error("AI returned an invalid response. Please try again.");
  error.statusCode = 502;
  throw error;
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096, modelName = "gemini-1.5-flash") {
  const { client, apiKey } = getAiClient();
  try {
    const stream = await client.models.generateContentStream({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: maxTokens,
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    if (error.status === 429) geminiKeys.markExhausted(apiKey);
    throw geminiError(error);
  }
}

async function generateText(messages, maxTokens = 1024, modelName = "gemini-1.5-flash") {
  try {
    let systemInstruction = "";
    const contents = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const config = {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
    };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const { client, apiKey } = getAiClient();
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents,
        config
      });

      return response.text || "";
    } catch (error) {
      if (error.status === 429) geminiKeys.markExhausted(apiKey);
      throw error;
    }
  } catch (error) {
    throw geminiError(error);
  }
}

module.exports = { generateJson, generateJsonStream, generateText };
