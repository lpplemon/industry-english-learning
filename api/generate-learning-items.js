const ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions'
};

const DEFAULT_MODELS = {
  openai: 'gpt-4.1-mini',
  deepseek: 'deepseek-chat'
};

function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function cleanText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function toDialogue(value) {
  if (Array.isArray(value)) {
    return value
      .map((line) => {
        if (!line) return '';
        if (typeof line === 'string') return line;
        const role = cleanText(line.role, 'speaker');
        const text = cleanText(line.text, '');
        return `${role}: ${text}`;
      })
      .filter(Boolean)
      .join('\n');
  }
  return cleanText(value, '');
}

function normalizeItem(item, index, batchOffset, profile, source) {
  const word = cleanText(item.word || item.term || item.english || item.title, '');
  const chinese = cleanText(item.chinese || item.meaning || item.translation || item.definition, '');
  const phrase = cleanText(item.phrase || item.example || item.exampleSentence || item.sentence, '');
  const phraseCn = cleanText(item.phraseCn || item.exampleCn || item.exampleChinese || item.sentenceCn, '');
  const scenario = cleanText(item.scenario || item.context || item.scene, 'real business scenario');
  const dialogue = toDialogue(item.dialogue || item.conversation || item.chat);
  const dialogueCn = toDialogue(item.dialogueCn || item.conversationCn || item.chatCn);
  const serial = Number(item.serial || batchOffset + index + 1);

  return {
    id: cleanText(item.id, `${source}-${serial}`),
    source: cleanText(item.source, source),
    batch: Number.isFinite(Number(item.batch)) ? Number(item.batch) : Math.floor((batchOffset + index) / 10) + 1,
    word: word || `${cleanText(profile.product, 'product')} term`,
    chinese: chinese || 'professional term',
    phrase: phrase || `We use ${word || cleanText(profile.product, 'product')} in this business context.`,
    phraseCn: phraseCn || '这是一个示例句，方便用户记忆。',
    scenario,
    dialogue: dialogue || `A: Could you explain ${word || cleanText(profile.product, 'product')}?\nB: Sure, let's review it in this business scenario.`,
    dialogueCn: dialogueCn || 'A：你能解释一下这个词吗？\nB：当然，我们可以在这个业务场景里理解它。',
    serial
  };
}

function parseJsonBlob(text) {
  const trimmed = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('AI returned invalid JSON.');
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const count = Math.min(Math.max(Number(body.count) || 10, 1), 20);
  const profile = body.profile || {};
  const connectionTest = Boolean(body.connectionTest);
  const provider = cleanText(body.provider, 'openai').toLowerCase();
  const apiKey = cleanText(body.apiKey, '');
  const model = cleanText(body.model, DEFAULT_MODELS[provider] || DEFAULT_MODELS.openai);
  const batchOffset = Math.max(0, Number(body.batchOffset) || 0);
  const industry = cleanText(profile.industry, '');
  const product = cleanText(profile.product, '');

  if (!ENDPOINTS[provider]) {
    return sendJson(res, 400, { error: 'Unsupported provider. Please choose OpenAI or DeepSeek.' });
  }
  if (!apiKey) {
    return sendJson(res, 400, { error: 'API key is required.' });
  }
  if (!connectionTest && (!industry || !product)) {
    return sendJson(res, 400, { error: 'Industry and product are required.' });
  }

  const prompt = connectionTest
    ? [
        'You are helping build a professional English learning app.',
        'This request is only used to verify that the API key and model are working.',
        'Return JSON only with this shape: {"items": [...]}',
        'Return exactly 1 item.',
        'Use a generic business example.',
        'Each item must include: word, chinese, phrase, phraseCn, scenario, dialogue, dialogueCn.'
      ].join('\n')
    : [
        'You are helping build a professional English learning app.',
        'Generate concise but realistic business learning content for the user\'s industry and product.',
        'Avoid generic filler, avoid repeating the same words, and avoid unrealistic equipment unless the industry truly requires it.',
        'Return JSON only with this shape: {"items": [...]}',
        `Need ${count} items.`,
        `Industry: ${industry}`,
        `Product: ${product}`,
        `English level (1-10): ${cleanText(profile.englishLevel, '1')}`,
        `Trade level (1-10): ${cleanText(profile.tradeLevel, '1')}`,
        `Priority skill gaps: ${cleanText(profile.focusAreas, 'general business communication')}`,
        `Already generated item count: ${batchOffset}. Do not repeat earlier common terms.`,
        'Do not teach elementary words below the learner level. Higher-level learners need precise terminology, risk judgment, negotiation language, and complex scenarios.',
        'Each item must include: word, chinese, phrase, phraseCn, scenario, dialogue, dialogueCn.',
        'The dialogue should feel like a real customer-service, sales, technical-support, or operations conversation in that industry.',
        'The Chinese content should be natural, sentence-level, and not fragmentary.',
        'Use short, practical examples that a learner can actually repeat aloud.'
      ].join('\n');

  let response;
  try {
    response = await fetch(ENDPOINTS[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum generator for industry-specific English learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
  } catch (error) {
    return sendJson(res, 502, { error: error.message || `Failed to reach ${provider}.` });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message || data?.error || `${provider} request failed.`;
    return sendJson(res, response.status, { error: message });
  }

  const raw = data?.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = parseJsonBlob(raw);
  } catch (error) {
    return sendJson(res, 502, {
      error: 'AI returned invalid JSON.',
      raw: String(raw).slice(0, 500)
    });
  }

  const items = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
  const normalized = items.slice(0, count).map((item, index) => normalizeItem(item, index, batchOffset, profile, provider));

  return sendJson(res, 200, {
    items: normalized,
    hasMore: true
  });
};
