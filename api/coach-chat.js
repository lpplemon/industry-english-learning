const { callAi, sendJson } = require("./_ai-client");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { coachId, customPrompt, provider, apiKey, model } = body;
  const role = coachId === "klaus"
    ? "You are a direct German customer. Ask for concrete data, risks and timelines."
    : coachId === "sarah"
      ? "You are a friendly but firm US purchasing manager focused on price, terms and supplier value."
      : `You are a professional English role-play partner for this scenario: ${customPrompt || "business negotiation"}.`;
  try {
    const result = await callAi({
      provider,
      apiKey,
      model,
      system: `${role} Reply in concise professional English under 80 words. Return JSON only with keys text and hint. The hint should coach language, business etiquette and clarity.`,
      messages: (body.messages || []).slice(-8).map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: String(message.content || "") })),
    });
    return sendJson(res, 200, { text: result.text || "Please continue.", hint: result.hint || "Use specific numbers and a clear next step." });
  } catch (error) {
    return sendJson(res, 502, { error: error.message || "Coach request failed." });
  }
};
