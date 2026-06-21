const Groq = require("groq-sdk");

const KeyManager = require("./keyManager");
const groqKeys = new KeyManager("GROQ_API_KEY");

function parseJson(value) {
  try {
    const cleaned = value.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function generateJson(systemPrompt, userPrompt, maxTokens = 4096, modelName = "llama-3.1-8b-instant") {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: maxTokens,
    });
    
    const result = parseJson(completion.choices[0]?.message?.content || "");
    if (!result) throw new Error("Groq returned invalid JSON");
    return result;
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

async function* generateJsonStream(systemPrompt, userPrompt, maxTokens = 4096, modelName = "llama-3.1-8b-instant") {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: true,
    });
    
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

async function generateText(messages, maxTokens = 1024, modelName = "llama-3.1-8b-instant") {
  const apiKey = groqKeys.getKey();
  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    if (error.status === 429 || (error.response && error.response.status === 429)) {
      groqKeys.markExhausted(apiKey);
    }
    throw error;
  }
}

module.exports = { generateJson, generateJsonStream, generateText, name: "groq" };
