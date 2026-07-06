const ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
};

function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function parseJson(text) {
  const clean = String(text || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    throw new Error("AI returned invalid JSON.");
  }
}

async function callAi({ provider, apiKey, model, system, messages, temperature = 0.6 }) {
  const endpoint = ENDPOINTS[provider];
  if (!endpoint) throw new Error("Unsupported AI provider.");
  if (!apiKey) throw new Error("API key is required.");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || data?.error || `AI request failed (${response.status}).`);
  return parseJson(data?.choices?.[0]?.message?.content || "{}");
}

module.exports = { callAi, sendJson };
