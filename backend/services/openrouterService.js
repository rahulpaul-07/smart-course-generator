const { OpenAI } = require("openai");
const KeyManager = require("./keyManager");
const { parseRobustJson, structuredAiLog } = require("./aiValidator");

const openrouterKeys = new KeyManager("OPENROUTER_API_KEY");

function getAiClient() {
  const apiKey = openrouterKeys.getKey();
  if (!apiKey) return { client: null, apiKey: null };
  return {
    client: new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    }),
    apiKey
  };
}

async function generateJson(systemPrompt, userPrompt, maxTokens = 4096, modelName = "anthropic/claude-3.5-sonnet") {
  const { client, apiKey } = getAiClient();
  if (!client) throw new Error("OpenRouter API key missing");

  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    return parseRobustJson(response.choices[0].message.content);
  } catch (error) {
    if (error.status === 429) {
      openrouterKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096, modelName = "anthropic/claude-3.5-sonnet") {
  const { client, apiKey } = getAiClient();
  if (!client) throw new Error("OpenRouter API key missing");

  try {
    const stream = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    if (error.status === 429) {
      openrouterKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

module.exports = {
  generateJson,
  generateJsonStream,
  generateText,
  generateTextStream,
};

async function generateText(messages, maxTokens = 1024, modelName = "anthropic/claude-3.5-sonnet") {
  const { client, apiKey } = getAiClient();
  if (!client) throw new Error("OpenRouter API key missing");

  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    if (error.status === 429) {
      openrouterKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function* generateTextStream(messages, maxTokens = 1024, modelName = "anthropic/claude-3.5-sonnet") {
  const { client, apiKey } = getAiClient();
  if (!client) throw new Error("OpenRouter API key missing");

  try {
    const stream = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    if (error.status === 429) {
      openrouterKeys.markExhausted(apiKey);
    }
    throw error;
  }
}
