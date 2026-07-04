const { GoogleGenAI } = require("@google/genai");

const KeyManager = require("./keyManager");
const geminiKeys = new KeyManager("GEMINI_API_KEY");

function getAiClient() {
  const apiKey = geminiKeys.getKey();
  return { client: new GoogleGenAI({ apiKey }), apiKey };
}

const { parseRobustJson } = require("./aiValidator");

async function generateJson(systemPrompt, userPrompt, maxTokens = 4096, modelName = "gemini-1.5-flash", signal = null) {
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
        abortSignal: signal || undefined,
      }
    });
    return parseRobustJson(response.text || "");
  } catch (error) {
    if (error.status === 429) geminiKeys.markExhausted(apiKey);
    throw error;
  }
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096, modelName = "gemini-1.5-flash", signal = null) {
  const { client, apiKey } = getAiClient();
  try {
    const stream = await client.models.generateContentStream({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: maxTokens,
        abortSignal: signal || undefined,
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    if (error.status === 429) geminiKeys.markExhausted(apiKey);
    throw error;
  }
}

async function generateText(messages, maxTokens = 1024, modelName = "gemini-1.5-flash", signal = null) {
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
  if (signal) {
    config.abortSignal = signal;
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
}

async function* generateTextStream(messages, maxTokens = 1024, modelName = "gemini-1.5-flash", signal = null) {
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
  if (signal) {
    config.abortSignal = signal;
  }

  const { client, apiKey } = getAiClient();
  try {
    const stream = await client.models.generateContentStream({
      model: modelName,
      contents,
      config
    });

    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    if (error.status === 429) geminiKeys.markExhausted(apiKey);
    throw error;
  }
}

async function generateCourseImage(prompt, signal = null) {
  const { client, apiKey } = getAiClient();
  try {
    const response = await client.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        abortSignal: signal || undefined,
      },
    });

    const image = response?.generatedImages?.[0]?.image;
    if (!image?.imageBytes) {
      throw new Error("No image data returned from Imagen");
    }

    const mimeType = image.mimeType || "image/png";
    return `data:${mimeType};base64,${image.imageBytes}`;
  } catch (error) {
    if (error.status === 429) geminiKeys.markExhausted(apiKey);
    throw error;
  }
}

module.exports = { generateJson, generateJsonStream, generateText, generateTextStream, generateCourseImage };
