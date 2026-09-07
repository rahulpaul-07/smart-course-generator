function parseRobustJson(value) {
  if (!value || typeof value !== 'string') {
    const err = new Error("Generation failed due to an incomplete AI response: Empty response.");
    err.failureCategory = "empty_response";
    throw err;
  }

  // Order matters. The previous version stripped fences *before* trimming, so a
  // response ending in "```\n" (a trailing newline after the closing fence, which
  // Gemini and Groq both emit) never matched /\n?```$/ and the fence survived
  // into JSON.parse. Trim first, then strip. Models also sometimes wrap the
  // block in a sentence ("Here is the JSON:"), so fall back to extracting the
  // first fenced block anywhere in the response.
  let cleaned = value.trim();

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    cleaned = fenced[1].trim();
  } else {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();
  }
  
  if (!cleaned) {
    const err = new Error("Generation failed due to an incomplete AI response: Missing JSON blocks.");
    err.failureCategory = "invalid_json";
    throw err;
  }

  if ((cleaned.startsWith('{') && !cleaned.endsWith('}')) || (cleaned.startsWith('[') && !cleaned.endsWith(']'))) {
    const err = new Error("Generation failed due to an incomplete AI response: Truncated JSON.");
    err.failureCategory = "invalid_json";
    throw err;
  }

  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    const err = new Error("The AI returned an invalid response. Please try again.");
    err.failureCategory = "invalid_json";
    err.cause = parseErr;
    throw err;
  }
}

function structuredAiLog(provider, requestType, failureCategory, errorMessage) {
  // Safe structured logging, no secrets
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "AI_FAILURE",
    provider: provider || "unknown",
    requestType: requestType || "unknown",
    failureCategory: failureCategory || "provider_error",
    error: errorMessage
  }));
}

module.exports = {
  parseRobustJson,
  structuredAiLog
};
