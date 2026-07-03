const Groq = require("groq-sdk");

const KeyManager = require("./keyManager");
const groqKeys = new KeyManager("GROQ_API_KEY");

const { parseRobustJson } = require("./aiValidator");
async function generateJson(
  systemPrompt,
  userPrompt,
  maxTokens = 4096,
  modelName = "llama-3.1-8b-instant",
  signal
) {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}

IMPORTANT:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON in triple backticks.
- Your response must be valid JSON.`,
        },
        {
          role: "user",
          content: `${userPrompt}

Respond with valid JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: maxTokens,
    }, { signal });

    return parseRobustJson(completion.choices[0]?.message?.content || "");
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096, modelName = "llama-3.1-8b-instant", signal) {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}

IMPORTANT:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON in triple backticks.
- Your entire response must be a single valid JSON object.`,
        },
        {
          role: "user",
          content: `${userPrompt}

Respond with valid JSON only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: true,
    }, { signal });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function generateText(messages, maxTokens = 1024, modelName = "llama-3.1-8b-instant", signal) {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }, { signal });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function* generateTextStream(messages, maxTokens = 1024, modelName = "llama-3.1-8b-instant", signal) {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
    }, { signal });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

module.exports = { generateJson, generateJsonStream, generateText, generateTextStream, name: "groq" };
