function parseRobustJson(value) {
  if (!value || typeof value !== 'string') {
    const err = new Error("Generation failed due to an incomplete AI response: Empty response.");
    err.failureCategory = "empty_response";
    throw err;
  }

  const cleaned = value.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  
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
