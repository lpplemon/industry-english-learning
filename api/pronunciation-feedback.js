const { callAi, sendJson } = require("./_ai-client");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  try {
    const result = await callAi({
      provider: body.provider,
      apiKey: body.apiKey,
      model: body.model,
      system: "You are an English pronunciation coach. Compare a target business term with a speech-to-text transcript. Return JSON only with isCorrect (boolean), accuracyScore (integer 0-100), and feedback (short actionable Chinese feedback).",
      messages: [{ role: "user", content: `Target term: ${body.term}\nSpeech transcript: ${body.text}` }],
      temperature: 0.2,
    });
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 502, { error: error.message || "Pronunciation request failed." });
  }
};
