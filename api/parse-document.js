const { callAi, sendJson } = require("./_ai-client");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  try {
    const result = await callAi({
      provider: body.provider,
      apiKey: body.apiKey,
      model: body.model,
      system: "You analyze work documents for an industry-English and global-trade knowledge base. Automatically classify the document. Return JSON only with title, fileType (PDF, Word Doc, or Image), summary (concise Chinese), tags (1-3 tags led by Products, Customers, Marketing, or Legal), keyConcepts, tradePhrases, and actionItems. Never ask the user to categorize it.",
      messages: [{ role: "user", content: `File: ${body.fileName}\nContent:\n${String(body.fileContent || "").slice(0, 30000)}` }],
      temperature: 0.3,
    });
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 502, { error: error.message || "Document parsing failed." });
  }
};
