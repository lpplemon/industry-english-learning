const GROUP_SIZE = 10;
const BUFFER_SIZE = 40;

const GENERAL_TERMS = [
  {
    term: "product specification",
    chinese: "产品规格",
    meaning: "用于说明产品参数、能力范围和适配条件"
  },
  {
    term: "customer requirement",
    chinese: "客户需求",
    meaning: "用于确认客户真正想解决的问题"
  },
  {
    term: "delivery schedule",
    chinese: "交付计划",
    meaning: "用于说明交期、节点和配合安排"
  },
  {
    term: "technical support",
    chinese: "技术支持",
    meaning: "用于处理安装、调试和使用问题"
  },
  {
    term: "quotation review",
    chinese: "报价确认",
    meaning: "用于解释价格、配置和服务内容"
  },
  {
    term: "service agreement",
    chinese: "服务协议",
    meaning: "用于界定责任、范围和支持时效"
  },
  {
    term: "quality inspection",
    chinese: "质量检验",
    meaning: "用于确认产品是否达到交付标准"
  },
  {
    term: "custom solution",
    chinese: "定制方案",
    meaning: "用于围绕客户场景调整产品和流程"
  },
  {
    term: "project timeline",
    chinese: "项目时间线",
    meaning: "用于安排实施顺序和关键时间点"
  },
  {
    term: "after-sales follow-up",
    chinese: "售后跟进",
    meaning: "用于持续维护客户体验和产品表现"
  }
];

const CABLE_TERMS = [
  {
    term: "extrusion line",
    chinese: "押出生产线",
    meaning: "用于完成电线电缆绝缘层或护套成型"
  },
  {
    term: "take-up unit",
    chinese: "收线装置",
    meaning: "用于稳定收卷成品线缆"
  },
  {
    term: "pay-off stand",
    chinese: "放线架",
    meaning: "用于稳定输送原材料线材"
  },
  {
    term: "tension control",
    chinese: "张力控制",
    meaning: "用于避免线材变形和断裂"
  },
  {
    term: "spark tester",
    chinese: "火花测试机",
    meaning: "用于检测绝缘层缺陷"
  },
  {
    term: "single-twist strander",
    chinese: "单绞机",
    meaning: "用于多股线材绞合"
  },
  {
    term: "back-twist unit",
    chinese: "退扭装置",
    meaning: "用于控制绞合过程中的回扭"
  },
  {
    term: "outer diameter",
    chinese: "外径",
    meaning: "用于检测线缆成品尺寸"
  },
  {
    term: "cooling trough",
    chinese: "冷却水槽",
    meaning: "用于帮助挤出后的材料定型"
  },
  {
    term: "inspection report",
    chinese: "检验报告",
    meaning: "用于交付前确认质量结果"
  }
];

const SCENARIOS = [
  { en: "customer inquiry", cn: "客户咨询" },
  { en: "product demo", cn: "产品演示" },
  { en: "quotation discussion", cn: "报价沟通" },
  { en: "technical meeting", cn: "技术会议" },
  { en: "delivery follow-up", cn: "交付跟进" },
  { en: "after-sales support", cn: "售后支持" },
  { en: "quality review", cn: "质量复盘" },
  { en: "training session", cn: "培训场景" }
];

const PROVIDER_DEFAULTS = {
  openai: "gpt-4.1-mini",
  deepseek: "deepseek-chat"
};

const state = {
  profile: loadJson("aiProfile", null),
  apiConfig: loadJson("aiApiConfig", {
    enabled: false,
    provider: "openai",
    apiKey: "",
    model: PROVIDER_DEFAULTS.openai
  }),
  imported: loadJson("aiImported", []),
  generated: loadJson("aiGenerated", []),
  mastered: new Set(loadJson("aiMastered", [])),
  review: new Set(loadJson("aiReview", [])),
  notes: loadJson("aiNotes", {}),
  accent: localStorage.getItem("accentMode") || "en-US",
  tab: "learn",
  gameMode: "match",
  gameAnswer: null,
  gameScore: Number(localStorage.getItem("gameScore") || 0),
  gameTotal: Number(localStorage.getItem("gameTotal") || 0),
  search: "",
  cursor: Number(localStorage.getItem("aiCursor") || 0),
  bank: []
};

const els = {
  profileLine: document.querySelector("#profileLine"),
  industryLine: document.querySelector("#industryLine"),
  productLine: document.querySelector("#productLine"),
  bankLine: document.querySelector("#bankLine"),
  apiLine: document.querySelector("#apiLine"),
  groupLine: document.querySelector("#groupLine"),
  masteredLine: document.querySelector("#masteredLine"),
  reviewLine: document.querySelector("#reviewLine"),
  progressCircle: document.querySelector("#progressCircle"),
  progressText: document.querySelector("#progressText"),
  progressHint: document.querySelector("#progressHint"),
  planTitle: document.querySelector("#planTitle"),
  sectionTitle: document.querySelector("#sectionTitle"),
  sectionSubtitle: document.querySelector("#sectionSubtitle"),
  searchInput: document.querySelector("#searchInput"),
  cards: document.querySelector("#cards"),
  gamePrompt: document.querySelector("#gamePrompt"),
  gameOptions: document.querySelector("#gameOptions"),
  setupModal: document.querySelector("#setupModal"),
  toast: document.querySelector("#toast"),
  apiStatusText: document.querySelector("#apiStatusText"),
  useCustomApi: document.querySelector("#useCustomApi"),
  apiProvider: document.querySelector("#apiProvider"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  apiModelInput: document.querySelector("#apiModelInput"),
  testApiBtn: document.querySelector("#testApiBtn")
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem("aiProfile", JSON.stringify(state.profile));
  localStorage.setItem("aiApiConfig", JSON.stringify(state.apiConfig));
  localStorage.setItem("aiImported", JSON.stringify(state.imported));
  localStorage.setItem("aiGenerated", JSON.stringify(state.generated));
  localStorage.setItem("aiMastered", JSON.stringify([...state.mastered]));
  localStorage.setItem("aiReview", JSON.stringify([...state.review]));
  localStorage.setItem("aiNotes", JSON.stringify(state.notes));
  localStorage.setItem("accentMode", state.accent);
  localStorage.setItem("gameScore", String(state.gameScore));
  localStorage.setItem("gameTotal", String(state.gameTotal));
  localStorage.setItem("aiCursor", String(state.cursor));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeMultiline(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function normalize(value, fallback = "") {
  return String(value || fallback).trim();
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function currentProfile() {
  return {
    name: normalize(state.profile?.name, "Learner"),
    industry: normalize(state.profile?.industry, ""),
    product: normalize(state.profile?.product, "")
  };
}

function usesCableTerms(industry, product) {
  return /wire|cable|extrusion|stranding|twist|押出|电缆|电线|绞线|单绞|放线|收线/i.test(
    `${industry} ${product}`
  );
}

function termPool(industry, product) {
  return usesCableTerms(industry, product) ? CABLE_TERMS : GENERAL_TERMS;
}

function rebuildBank() {
  state.bank = [...state.imported, ...state.generated];
}

function currentGroup() {
  return state.bank.slice(state.cursor, state.cursor + GROUP_SIZE);
}

function currentProvider() {
  return normalize(state.apiConfig?.provider, "openai");
}

function apiEnabled() {
  return Boolean(state.apiConfig?.enabled && state.apiConfig?.apiKey);
}

function currentModelFor(provider) {
  return PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.openai;
}

function syncApiControls() {
  const provider = currentProvider();
  const defaultModel = currentModelFor(provider);

  if (els.useCustomApi) els.useCustomApi.checked = Boolean(state.apiConfig?.enabled);
  if (els.apiProvider) els.apiProvider.value = provider;
  if (els.apiKeyInput) els.apiKeyInput.value = state.apiConfig?.apiKey || "";
  if (els.apiModelInput) {
    els.apiModelInput.placeholder = defaultModel;
    els.apiModelInput.value = state.apiConfig?.model || defaultModel;
  }

  if (els.apiStatusText) {
    els.apiStatusText.textContent = apiEnabled() ? "已启用" : "未启用";
  }

  if (els.apiLine) {
    els.apiLine.textContent = apiEnabled()
      ? `${provider} / ${state.apiConfig.model || defaultModel}`
      : "未连接";
  }
}

function readApiControls() {
  const provider = normalize(els.apiProvider?.value, "openai");
  return {
    enabled: Boolean(els.useCustomApi?.checked),
    provider,
    apiKey: normalize(els.apiKeyInput?.value, ""),
    model: normalize(els.apiModelInput?.value, currentModelFor(provider))
  };
}

function persistApiControls() {
  state.apiConfig = readApiControls();
  saveState();
  syncApiControls();
}

function groupDoneCount() {
  return currentGroup().filter((item) => state.mastered.has(item.id)).length;
}

function makeLocalItem(index, batchOffset, profile) {
  const pool = termPool(profile.industry, profile.product);
  const base = pool[index % pool.length];
  const scenario = SCENARIOS[index % SCENARIOS.length];
  const serial = batchOffset + index + 1;
  const product = profile.product || "product";
  const industry = profile.industry || "business";
  const term = `${product} ${base.term}`;

  return {
    id: `local-${serial}`,
    source: "本地生成",
    batch: Math.floor(batchOffset / GROUP_SIZE) + 1,
    word: term,
    chinese: `${product}相关${base.chinese}`,
    phrase: `We use ${term} during the ${scenario.en} to improve clarity and execution.`,
    phraseCn: `我们会在${scenario.cn}中使用这个表达，让沟通和执行更清晰。`,
    scenario: scenario.cn,
    dialogue: `Customer: How does ${term} help in daily work?\nSpecialist: It helps us explain ${base.meaning} in a practical way.`,
    dialogueCn: `客户：${term} 在日常工作里有什么作用？\n顾问：它能帮助我们更实际地说明${base.meaning}。`,
    serial
  };
}

function normalizeApiItem(item, index, batchOffset) {
  const profile = currentProfile();
  const serial = Number(item.serial || batchOffset + index + 1);
  return {
    id: normalize(item.id, `api-${serial}`),
    source: normalize(item.source, "AI生成"),
    batch: Number(item.batch) || Math.floor((batchOffset + index) / GROUP_SIZE) + 1,
    word: normalize(item.word, `${profile.product || "product"} term`),
    chinese: normalize(item.chinese, "专业词义"),
    phrase: normalize(item.phrase, `We use ${profile.product || "this term"} in our workflow.`),
    phraseCn: normalize(item.phraseCn, "这是便于记忆的示例句。"),
    scenario: normalize(item.scenario, "真实业务场景"),
    dialogue: normalize(
      Array.isArray(item.dialogue)
        ? item.dialogue
            .map((line) => `${normalize(line.role, "Speaker")}: ${normalize(line.text)}`)
            .join("\n")
        : item.dialogue,
      "Customer: Could you explain this term?\nSpecialist: Sure, let me explain it in context."
    ),
    dialogueCn: normalize(
      Array.isArray(item.dialogueCn)
        ? item.dialogueCn
            .map((line) => `${normalize(line.role, "角色")}: ${normalize(line.text)}`)
            .join("\n")
        : item.dialogueCn,
      "客户：你能解释一下这个词吗？\n顾问：可以，我结合场景来说明。"
    ),
    serial
  };
}

async function fetchApiItems(count) {
  if (!apiEnabled()) return [];

  const response = await fetch("/api/generate-learning-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count,
      profile: currentProfile(),
      provider: state.apiConfig.provider,
      apiKey: state.apiConfig.apiKey,
      model: state.apiConfig.model,
      batchOffset: state.generated.length
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API 请求失败 (${response.status})`);
  }

  return Array.isArray(data.items) ? data.items : [];
}

async function topUpBank(count = BUFFER_SIZE) {
  if (!state.profile) return;

  const profile = currentProfile();
  if (!profile.industry || !profile.product) return;

  if (apiEnabled()) {
    const items = await fetchApiItems(count);
    state.generated = state.generated.concat(
      items.map((item, index) => normalizeApiItem(item, index, state.generated.length))
    );
  } else {
    const batchOffset = state.generated.length;
    const items = Array.from({ length: count }, (_, index) =>
      makeLocalItem(index, batchOffset, profile)
    );
    state.generated = state.generated.concat(items);
  }

  rebuildBank();
  saveState();
  render();
}

function filteredItems(items) {
  const query = normalize(state.search).toLowerCase();
  if (!query) return items;

  return items.filter((item) =>
    [
      item.word,
      item.chinese,
      item.phrase,
      item.phraseCn,
      item.scenario,
      item.dialogue,
      item.dialogueCn
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器不支持语音播放");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.accent;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function renderShell() {
  syncApiControls();

  const profile = currentProfile();
  els.profileLine.textContent = state.profile
    ? `${profile.name} / ${profile.industry} / ${profile.product}`
    : "输入你的行业和产品，生成专属专业英语库";
  els.industryLine.textContent = profile.industry || "未设置";
  els.productLine.textContent = profile.product || "未设置";
  els.bankLine.textContent = `${state.bank.length} 条`;
  els.masteredLine.textContent = String(state.mastered.size);
  els.reviewLine.textContent = String(state.review.size);
  els.planTitle.textContent = state.profile
    ? `${profile.industry} / ${profile.product} 专业英语循环学习`
    : "先设置你的行业和产品";

  const done = groupDoneCount();
  const percent = Math.round((done / GROUP_SIZE) * 100);
  els.groupLine.textContent = `${done} / ${GROUP_SIZE}`;
  els.progressText.textContent = `${percent}%`;
  if (els.progressCircle) {
    els.progressCircle.style.strokeDashoffset = `${314 - (314 * percent) / 100}`;
  }
  els.progressHint.textContent =
    percent >= 100
      ? "本组已完成，下一组内容已经准备好了。"
      : "学完这一组后，系统会自动给你推送下一组。";

  document.querySelectorAll(".accent-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.accent === state.accent);
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.tab);
  });
}

function renderEmpty(message) {
  els.cards.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function renderCards(items, compact = false) {
  if (!items.length) {
    renderEmpty("当前还没有可学习内容。你可以先生成内容、导入表格，或者手动添加。");
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const done = state.mastered.has(item.id);
      const inReview = state.review.has(item.id);
      const note = state.notes[item.id] || "";

      return `
        <article class="card ai-card">
          <div class="card-topline">
            <span class="tag">${escapeHtml(item.source)} / 第${escapeHtml(item.batch)}组 / ${escapeHtml(item.scenario)}</span>
            <button class="mini-btn" data-expand="${escapeHtml(item.id)}" type="button">${compact ? "查看" : "场景"}</button>
          </div>
          <strong>${escapeHtml(item.word)}</strong>
          <p class="translation">${escapeHtml(item.chinese)}</p>
          <div class="scenario-box ${compact ? "hidden" : ""}" data-detail="${escapeHtml(item.id)}">
            <p><b>场景句：</b>${escapeHtml(item.phrase)}</p>
            <p>${escapeHtml(item.phraseCn)}</p>
            <p><b>对话：</b>${escapeMultiline(item.dialogue)}</p>
            <p>${escapeMultiline(item.dialogueCn)}</p>
          </div>
          <textarea class="note-input" data-note="${escapeHtml(item.id)}" rows="2" placeholder="写下你自己的记忆提示">${escapeHtml(note)}</textarea>
          <div class="card-actions">
            <button class="sound-btn" data-speak="${escapeHtml(item.word)}" type="button">读单词</button>
            <button class="sound-btn" data-speak="${escapeHtml(item.phrase)}" type="button">读句子</button>
            <button class="mastered-btn ${done ? "done" : ""}" data-master="${escapeHtml(item.id)}" type="button">${done ? "已掌握" : "掌握"}</button>
            <button class="unknown-btn ${inReview ? "done" : ""}" data-review="${escapeHtml(item.id)}" type="button">${inReview ? "复习中" : "加入复习"}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStats() {
  const accuracy = state.gameTotal
    ? Math.round((state.gameScore / state.gameTotal) * 100)
    : 0;

  els.cards.innerHTML = `
    <article class="stat-card"><span>词库总量</span><strong>${state.bank.length}</strong></article>
    <article class="stat-card"><span>已掌握</span><strong>${state.mastered.size}</strong></article>
    <article class="stat-card"><span>待复习</span><strong>${state.review.size}</strong></article>
    <article class="stat-card"><span>小游戏正确率</span><strong>${accuracy}%</strong></article>
    <div class="empty-state">系统会按组持续补充新内容，学完 5000 条后也会继续续写新批次。</div>
  `;
}

function renderGamesIntro() {
  els.cards.innerHTML = `
    <div class="empty-state">
      右侧互动练习会从当前学习组出题，支持释义快选、语句填空和对话补全。
    </div>
  `;
}

function render() {
  renderShell();

  const titles = {
    learn: ["今日学习组", "每组 10 条，包含专业单词、语句、场景和对话。"],
    review: ["复习内容", "答错或加入复习的内容会在这里重复出现。"],
    games: ["互动练习", "用当前学习组做快选、填空和对话补全。"],
    bank: ["词库总览", "查看 AI 生成和你导入的全部内容。"],
    stats: ["数据复盘", "查看掌握量、复习量和练习正确率。"]
  };

  const [title, subtitle] = titles[state.tab];
  els.sectionTitle.textContent = title;
  els.sectionSubtitle.textContent = subtitle;

  if (!state.profile) {
    renderEmpty("先填写你的行业和产品，再生成专属词库。");
    return;
  }

  if (!state.bank.length && state.tab !== "games" && state.tab !== "stats") {
    renderEmpty("当前还没有学习内容，点击左侧按钮开始生成。");
    return;
  }

  if (state.tab === "learn") {
    renderCards(filteredItems(currentGroup()));
    return;
  }

  if (state.tab === "review") {
    renderCards(filteredItems(state.bank.filter((item) => state.review.has(item.id))));
    return;
  }

  if (state.tab === "bank") {
    renderCards(filteredItems(state.bank).slice(0, 80), true);
    return;
  }

  if (state.tab === "games") {
    renderGamesIntro();
    return;
  }

  renderStats();
}

function parseTable(text) {
  const delimiter = text.includes("\t") ? "\t" : ",";
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()));

  if (!rows.length) return [];

  const headers = rows[0].map((header) => header.toLowerCase());
  const findIndex = (...names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const wordIndex = findIndex("word", "english", "term");
  const chineseIndex = findIndex("chinese", "meaning");
  const phraseIndex = findIndex("phrase", "sentence");
  const scenarioIndex = findIndex("scenario");
  const dialogueIndex = findIndex("dialogue");

  return rows
    .slice(1)
    .map((row, index) => {
      const word = row[wordIndex] || row[0];
      if (!word) return null;

      return {
        id: `import-${Date.now()}-${index}`,
        source: "表格导入",
        batch: "自定义",
        word,
        chinese: row[chineseIndex] || "自定义释义",
        phrase: row[phraseIndex] || `We need to discuss ${word}.`,
        phraseCn: "这是导入内容自动补充的中文例句。",
        scenario: row[scenarioIndex] || "自定义场景",
        dialogue: row[dialogueIndex] || `A: Could you explain ${word}?\nB: Sure, it is important in our workflow.`,
        dialogueCn: "A：你能解释一下这个词吗？\nB：可以，它在我们的流程里很重要。",
        serial: state.bank.length + index + 1
      };
    })
    .filter(Boolean);
}

function setGamePrompt() {
  if (state.gameMode === "match") {
    els.gamePrompt.textContent = "从当前学习组里，选择正确的英文表达。";
    return;
  }

  if (state.gameMode === "fill") {
    els.gamePrompt.textContent = "根据上下文补全缺失单词。";
    return;
  }

  els.gamePrompt.textContent = "根据业务场景补全下一句对话。";
}

function startGame() {
  const group = currentGroup();
  if (!group.length) {
    showToast("先生成一组内容，再开始互动练习。");
    return;
  }

  const item = group[Math.floor(Math.random() * group.length)];
  state.gameAnswer = item;
  state.gameTotal += 1;
  saveState();

  if (state.gameMode === "match") {
    const options = [item];
    while (options.length < Math.min(4, group.length)) {
      const candidate = group[Math.floor(Math.random() * group.length)];
      if (!options.some((option) => option.id === candidate.id)) {
        options.push(candidate);
      }
    }

    els.gamePrompt.innerHTML = `<strong>${escapeHtml(item.chinese)}</strong><br>请选择对应英文`;
    els.gameOptions.innerHTML = options
      .sort(() => Math.random() - 0.5)
      .map(
        (option) =>
          `<button class="option-btn" data-answer="${escapeHtml(option.id)}" type="button">${escapeHtml(option.word)}</button>`
      )
      .join("");
    return;
  }

  if (state.gameMode === "fill") {
    const words = item.phrase.split(" ");
    const blankIndex = Math.max(0, Math.floor(words.length / 2));
    state.gameAnswer.blank = words[blankIndex].replace(/[,.?!]/g, "");
    words[blankIndex] = "_____";

    els.gamePrompt.innerHTML = `${escapeHtml(words.join(" "))}<br><small>${escapeHtml(item.phraseCn)}</small>`;
    els.gameOptions.innerHTML = `
      <input id="blankInput" placeholder="输入缺失单词" />
      <button class="option-btn" data-blank="1" type="button">提交</button>
    `;
    return;
  }

  const firstLine = item.dialogue.split("\n")[0] || item.dialogue;
  els.gamePrompt.innerHTML = `${escapeHtml(firstLine)}<br><strong>补全下一句：</strong>`;
  els.gameOptions.innerHTML = `
    <textarea id="dialogueInput" rows="3" placeholder="输入你认为合适的回应"></textarea>
    <button class="option-btn" data-dialogue="1" type="button">提交</button>
  `;
}

function finishGame(correct) {
  if (!state.gameAnswer) return;

  if (correct) {
    state.gameScore += 1;
    state.mastered.add(state.gameAnswer.id);
    state.review.delete(state.gameAnswer.id);
    showToast("回答正确，已计入掌握。");
  } else {
    state.review.add(state.gameAnswer.id);
    showToast("已加入复习库。");
  }

  saveState();
  renderShell();
}

async function advanceGroup(force) {
  if (!force && currentGroup().some((item) => !state.mastered.has(item.id))) {
    showToast("这一组还有没掌握的内容，也可以继续往下推进。");
  }

  state.cursor += GROUP_SIZE;
  if (state.cursor + GROUP_SIZE > state.bank.length) {
    await topUpBank(apiEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  }

  saveState();
  render();
}

async function testApiConnection() {
  const config = readApiControls();
  if (!config.apiKey) {
    showToast("请先填写 API Key");
    return;
  }

  const response = await fetch("/api/generate-learning-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count: 1,
      profile: currentProfile(),
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      batchOffset: 0
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API 请求失败 (${response.status})`);
  }

  state.apiConfig = config;
  saveState();
  syncApiControls();
}

document.querySelector("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = normalize(document.querySelector("#nameInput").value, "Learner");
  const industry = normalize(document.querySelector("#industryInput").value, "");
  const product = normalize(document.querySelector("#productInput").value, "");

  if (!industry || !product) {
    showToast("请先填写行业和产品。");
    return;
  }

  state.profile = { name, industry, product };
  state.imported = [];
  state.generated = [];
  state.mastered.clear();
  state.review.clear();
  state.notes = {};
  state.cursor = 0;
  persistApiControls();

  els.setupModal.classList.add("hidden");
  await topUpBank(apiEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  render();
});

document.querySelector("#openSetupBtn").addEventListener("click", () => {
  syncApiControls();
  els.setupModal.classList.remove("hidden");
});

document.querySelector("#closeSetupBtn").addEventListener("click", () => {
  if (!state.profile) {
    showToast("请先填写行业和产品。");
    return;
  }
  els.setupModal.classList.add("hidden");
});

els.testApiBtn.addEventListener("click", async () => {
  try {
    await testApiConnection();
    showToast("API 连接成功");
  } catch (error) {
    showToast(error.message || "API 连接失败");
  }
});

els.useCustomApi.addEventListener("change", persistApiControls);
els.apiProvider.addEventListener("change", () => {
  const provider = normalize(els.apiProvider.value, "openai");
  els.apiModelInput.value = currentModelFor(provider);
  persistApiControls();
});
els.apiKeyInput.addEventListener("input", persistApiControls);
els.apiModelInput.addEventListener("input", persistApiControls);

document.querySelector("#generateBtn").addEventListener("click", async () => {
  if (!state.profile) {
    els.setupModal.classList.remove("hidden");
    return;
  }

  try {
    await topUpBank(apiEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
    showToast(apiEnabled() ? "已通过你的 API 续写一批内容。" : "已生成新的学习内容。");
  } catch (error) {
    showToast(error.message || "生成失败");
  }
});

document.querySelector("#nextGroupBtn").addEventListener("click", async () => {
  await advanceGroup(true);
});

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.tab = button.dataset.tab;
  render();
});

document.querySelector(".accent-toggle").addEventListener("click", (event) => {
  const button = event.target.closest("[data-accent]");
  if (!button) return;
  state.accent = button.dataset.accent;
  saveState();
  renderShell();
});

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

els.cards.addEventListener("click", async (event) => {
  const speakButton = event.target.closest("[data-speak]");
  if (speakButton) {
    speak(speakButton.dataset.speak);
    return;
  }

  const masterButton = event.target.closest("[data-master]");
  if (masterButton) {
    state.mastered.add(masterButton.dataset.master);
    state.review.delete(masterButton.dataset.master);
    saveState();
    render();
    if (groupDoneCount() >= GROUP_SIZE) {
      await advanceGroup(true);
    }
    return;
  }

  const reviewButton = event.target.closest("[data-review]");
  if (reviewButton) {
    state.review.add(reviewButton.dataset.review);
    saveState();
    render();
    return;
  }

  const expandButton = event.target.closest("[data-expand]");
  if (expandButton) {
    const detail = document.querySelector(`[data-detail="${expandButton.dataset.expand}"]`);
    if (detail) detail.classList.toggle("hidden");
  }
});

els.cards.addEventListener("input", (event) => {
  const note = event.target.closest("[data-note]");
  if (!note) return;
  state.notes[note.dataset.note] = note.value;
  saveState();
});

document.querySelector("#customForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const word = normalize(document.querySelector("#customWord").value, "");
  const chinese = normalize(document.querySelector("#customChinese").value, "");
  const phrase = normalize(
    document.querySelector("#customPhrase").value,
    `We need to discuss ${word}.`
  );

  if (!word || !chinese) {
    showToast("请至少填写单词和中文释义。");
    return;
  }

  state.imported.unshift({
    id: `custom-${Date.now()}`,
    source: "手动添加",
    batch: "自定义",
    word,
    chinese,
    phrase,
    phraseCn: "这是你手动补充的重点表达。",
    scenario: "个人重点",
    dialogue: `A: Could you explain ${word}?\nB: Sure. ${phrase}`,
    dialogueCn: `A：你能解释一下 ${word} 吗？\nB：可以。${chinese}`,
    serial: state.bank.length + 1
  });

  rebuildBank();
  saveState();
  event.target.reset();
  render();
  showToast("已加入持续练习库。");
});

document.querySelector("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const items = parseTable(text);
  state.imported = items.concat(state.imported);
  state.cursor = 0;
  rebuildBank();
  saveState();
  render();
  showToast(`已导入 ${items.length} 条学习素材。`);
});

document.querySelector(".game-mode").addEventListener("click", (event) => {
  const button = event.target.closest("[data-game]");
  if (!button) return;
  state.gameMode = button.dataset.game;
  document.querySelectorAll(".mode-btn").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
  els.gameOptions.innerHTML = "";
  setGamePrompt();
});

document.querySelector("#startGameBtn").addEventListener("click", startGame);

els.gameOptions.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  if (answer) {
    finishGame(answer.dataset.answer === state.gameAnswer?.id);
    return;
  }

  if (event.target.closest("[data-blank]")) {
    const value = normalize(document.querySelector("#blankInput").value, "").toLowerCase();
    finishGame(value === normalize(state.gameAnswer?.blank, "").toLowerCase());
    return;
  }

  if (event.target.closest("[data-dialogue]")) {
    const value = normalize(document.querySelector("#dialogueInput").value, "");
    finishGame(value.length >= 10);
  }
});

rebuildBank();
syncApiControls();
setGamePrompt();
render();

if (state.profile && !state.bank.length) {
  void topUpBank(apiEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
}

if (!state.profile) {
  els.setupModal.classList.remove("hidden");
}
