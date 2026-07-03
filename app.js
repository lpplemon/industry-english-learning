const GROUP_SIZE = 10;
const BATCH_SIZE = 5000;

const roots = [
  ["compliance", "合规", "确认要求和文件是否满足客户或监管标准"],
  ["specification", "规格", "说明产品参数、性能指标和适配边界"],
  ["quotation", "报价", "向客户说明价格、交付周期和商务条件"],
  ["installation", "安装", "安排产品部署、调试和现场支持"],
  ["maintenance", "维护", "处理保养、故障预防和售后巡检"],
  ["warranty", "质保", "说明保修范围、期限和责任边界"],
  ["customization", "定制", "根据客户业务场景调整方案或配置"],
  ["integration", "集成", "让产品与客户现有系统或流程协同"],
  ["inspection", "检验", "确认质量、功能、安全和交付状态"],
  ["certification", "认证", "准备证书、测试报告和准入材料"],
  ["procurement", "采购", "沟通采购流程、预算和审批节点"],
  ["deployment", "部署", "上线方案、实施计划和验收安排"],
  ["risk assessment", "风险评估", "识别项目、合规或交付风险"],
  ["after-sales support", "售后支持", "处理客户问题、维修和持续服务"],
  ["lead time", "交付周期", "说明生产、备货、发货所需时间"],
  ["technical parameter", "技术参数", "描述关键性能和适用条件"],
  ["sample approval", "样品确认", "让客户确认样品、版本或方案"],
  ["user training", "用户培训", "帮助客户掌握产品使用方法"],
  ["troubleshooting", "故障排查", "定位问题原因并提供解决方案"],
  ["performance report", "性能报告", "总结产品表现、数据和改进建议"],
  ["service agreement", "服务协议", "明确服务范围、响应时间和费用"],
  ["quality control", "质量控制", "确保产品或服务达到标准"],
  ["delivery schedule", "交付计划", "确认发货、安装或项目节点"],
  ["technical proposal", "技术方案", "向客户展示解决路径和价值"],
  ["cost breakdown", "成本明细", "解释费用构成和报价依据"]
];

const modifiers = [
  "advanced", "standard", "custom", "automated", "remote", "on-site", "real-time", "high-efficiency",
  "low-risk", "scalable", "certified", "modular", "predictive", "preventive", "cross-border", "enterprise"
];

const scenarios = [
  "客户首次咨询", "产品演示", "技术答疑", "方案报价", "合同沟通", "交付确认", "售后支持", "质量复盘",
  "培训沟通", "投诉处理", "项目启动", "验收会议", "复购跟进", "风险说明", "资料提交", "进度同步"
];

const state = {
  profile: JSON.parse(localStorage.getItem("aiProfile") || "null"),
  bank: [],
  imported: JSON.parse(localStorage.getItem("aiImported") || "[]"),
  generatedBatches: Number(localStorage.getItem("aiGeneratedBatches") || 0),
  cursor: Number(localStorage.getItem("aiCursor") || 0),
  mastered: new Set(JSON.parse(localStorage.getItem("aiMastered") || "[]")),
  review: new Set(JSON.parse(localStorage.getItem("aiReview") || "[]")),
  notes: JSON.parse(localStorage.getItem("aiNotes") || "{}"),
  accent: localStorage.getItem("accentMode") || "en-US",
  tab: "learn",
  gameMode: "match",
  gameAnswer: null,
  gameScore: Number(localStorage.getItem("gameScore") || 0),
  gameTotal: Number(localStorage.getItem("gameTotal") || 0),
  search: ""
};

const els = {
  profileLine: document.querySelector("#profileLine"),
  industryLine: document.querySelector("#industryLine"),
  productLine: document.querySelector("#productLine"),
  bankLine: document.querySelector("#bankLine"),
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
  toast: document.querySelector("#toast")
};

const tabCopy = {
  learn: ["今日学习组", "每组 10 条，学完自动推送下一组。"],
  review: ["复习库", "答错、不认识或手动加入的内容会在这里反复出现。"],
  games: ["互动练习", "用当前学习组做快选、填空和对话补全。"],
  bank: ["词库总览", "查看 AI 已生成和你导入的全部学习素材。"],
  stats: ["数据复盘", "查看掌握量、复习量、正确率和词库续写状态。"]
};

function save() {
  localStorage.setItem("aiProfile", JSON.stringify(state.profile));
  localStorage.setItem("aiImported", JSON.stringify(state.imported));
  localStorage.setItem("aiGeneratedBatches", String(state.generatedBatches));
  localStorage.setItem("aiCursor", String(state.cursor));
  localStorage.setItem("aiMastered", JSON.stringify([...state.mastered]));
  localStorage.setItem("aiReview", JSON.stringify([...state.review]));
  localStorage.setItem("aiNotes", JSON.stringify(state.notes));
  localStorage.setItem("accentMode", state.accent);
  localStorage.setItem("gameScore", String(state.gameScore));
  localStorage.setItem("gameTotal", String(state.gameTotal));
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalize(value, fallback) {
  return String(value || fallback).trim();
}

function makeItem(index, batchOffset, industry, product) {
  const root = roots[index % roots.length];
  const modifier = modifiers[Math.floor(index / roots.length) % modifiers.length];
  const scenario = scenarios[index % scenarios.length];
  const serial = batchOffset + index + 1;
  const term = `${modifier} ${product} ${root[0]}`;
  const cn = `${product}${root[1]}：用于${industry}场景，${root[2]}`;
  const phrase = `We need to review the ${term} before the next ${scenario.toLowerCase()} session.`;
  const phraseCn = `我们需要在下一次${scenario}前确认${term}。`;
  const dialogue = `Client: How does your ${product} handle ${root[0]}?\nSpecialist: We provide a ${modifier} workflow for ${industry}, including clear steps, documents, and follow-up support.`;
  const dialogueCn = `客户：你们的${product}如何处理${root[1]}？\n专员：我们为${industry}提供${modifier}流程，包括清晰步骤、资料和后续支持。`;
  return {
    id: `ai-${serial}`,
    source: "AI生成",
    batch: Math.floor(batchOffset / BATCH_SIZE) + 1,
    word: term,
    chinese: cn,
    phrase,
    phraseCn,
    scenario,
    dialogue,
    dialogueCn,
    serial
  };
}

function rebuildBank() {
  if (!state.profile) {
    state.bank = state.imported;
    return;
  }
  const industry = normalize(state.profile.industry, "你的行业");
  const product = normalize(state.profile.product, "你的产品");
  const generated = [];
  for (let batch = 0; batch < state.generatedBatches; batch += 1) {
    const offset = batch * BATCH_SIZE;
    for (let index = 0; index < BATCH_SIZE; index += 1) {
      generated.push(makeItem(index, offset, industry, product));
    }
  }
  state.bank = state.imported.concat(generated);
}

function generateBatch() {
  state.generatedBatches += 1;
  rebuildBank();
  save();
  toast(`AI已生成新的 ${BATCH_SIZE} 条专业单词、语句和场景对话。`);
  render();
}

function currentGroup() {
  if (!state.bank.length) return [];
  if (state.cursor >= state.bank.length) generateBatch();
  return state.bank.slice(state.cursor, state.cursor + GROUP_SIZE);
}

function groupDoneCount() {
  return currentGroup().filter((item) => state.mastered.has(item.id)).length;
}

function advanceGroup(force = false) {
  const group = currentGroup();
  if (!force && group.some((item) => !state.mastered.has(item.id))) {
    toast("这一组还有内容没掌握，当然也可以继续强制换组。");
  }
  state.cursor += GROUP_SIZE;
  if (state.cursor >= state.bank.length) generateBatch();
  save();
  render();
}

function filtered(items) {
  const q = state.search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => `${item.word} ${item.chinese} ${item.phrase} ${item.scenario} ${item.dialogue}`.toLowerCase().includes(q));
}

function renderShell() {
  const profile = state.profile;
  els.profileLine.textContent = profile ? `${profile.name} · ${profile.industry} · ${profile.product}` : "输入你的行业和产品，生成专属专业英语库";
  els.industryLine.textContent = profile?.industry || "未设置";
  els.productLine.textContent = profile?.product || "未设置";
  els.bankLine.textContent = `${state.bank.length.toLocaleString()} 条`;
  els.masteredLine.textContent = state.mastered.size;
  els.reviewLine.textContent = state.review.size;
  els.planTitle.textContent = profile ? `${profile.industry} / ${profile.product} 专业英语循环学习` : "先设置你的行业和产品";

  const done = groupDoneCount();
  const percent = Math.round((done / GROUP_SIZE) * 100);
  els.groupLine.textContent = `${done} / ${GROUP_SIZE}`;
  els.progressText.textContent = `${percent}%`;
  els.progressCircle.style.strokeDashoffset = `${314 - (314 * percent) / 100}`;
  els.progressHint.textContent = percent >= 100 ? "本组已完成，下一组新内容已经准备好。" : "学完这一组后，系统会自动给你推送下一组。";

  document.querySelectorAll(".accent-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.accent === state.accent);
  });
}

function render() {
  renderShell();
  const [title, subtitle] = tabCopy[state.tab];
  els.sectionTitle.textContent = title;
  els.sectionSubtitle.textContent = subtitle;
  if (!state.profile || !state.bank.length) {
    els.cards.innerHTML = `<div class="empty-state">先填写行业和产品，点击“AI生成我的专业词库”。</div>`;
    return;
  }
  if (state.tab === "learn") return renderCards(filtered(currentGroup()));
  if (state.tab === "review") return renderCards(filtered(state.bank.filter((item) => state.review.has(item.id))));
  if (state.tab === "bank") return renderCards(filtered(state.bank).slice(0, 80), true);
  if (state.tab === "games") return renderGameIntro();
  return renderStats();
}

function renderCards(items, compact = false) {
  if (!items.length) {
    els.cards.innerHTML = `<div class="empty-state">这里暂时没有内容。你可以导入表格，或继续让AI生成新词库。</div>`;
    return;
  }
  els.cards.innerHTML = items.map((item) => {
    const mastered = state.mastered.has(item.id);
    const reviewing = state.review.has(item.id);
    const note = state.notes[item.id] || "";
    return `
      <article class="card ai-card">
        <div class="card-topline">
          <span class="tag">${item.source} · 第${item.batch || 1}批 · ${item.scenario}</span>
          <button class="mini-btn" data-expand="${item.id}" type="button">${compact ? "查看" : "场景"}</button>
        </div>
        <strong>${escapeHtml(item.word)}</strong>
        <p class="translation">${escapeHtml(item.chinese)}</p>
        <div class="scenario-box ${compact ? "hidden" : ""}" data-detail="${item.id}">
          <p><b>场景语句：</b>${escapeHtml(item.phrase)}</p>
          <p>${escapeHtml(item.phraseCn)}</p>
          <p><b>情景对话：</b>${escapeHtml(item.dialogue).replaceAll("\n", "<br>")}</p>
          <p>${escapeHtml(item.dialogueCn).replaceAll("\n", "<br>")}</p>
        </div>
        <textarea class="note-input" data-note="${item.id}" rows="2" placeholder="添加自己的理解或工作备注">${escapeHtml(note)}</textarea>
        <div class="card-actions">
          <button class="sound-btn" data-speak="${escapeHtml(item.word)}" type="button">读单词</button>
          <button class="sound-btn" data-speak="${escapeHtml(item.phrase)}" type="button">读语句</button>
          <button class="mastered-btn ${mastered ? "done" : ""}" data-master="${item.id}" type="button">${mastered ? "已掌握" : "掌握"}</button>
          <button class="unknown-btn ${reviewing ? "done" : ""}" data-review="${item.id}" type="button">${reviewing ? "复习中" : "加入复习"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderGameIntro() {
  els.cards.innerHTML = `
    <div class="empty-state">
      右侧互动练习会从当前学习组抽题：释义快选练单词，语句填空练表达，对话补全练真实沟通。
    </div>
  `;
}

function renderStats() {
  const accuracy = state.gameTotal ? Math.round((state.gameScore / state.gameTotal) * 100) : 0;
  const remaining = Math.max(0, state.bank.length - state.cursor);
  els.cards.innerHTML = `
    <article class="stat-card"><span>AI词库总量</span><strong>${state.bank.length.toLocaleString()}</strong></article>
    <article class="stat-card"><span>已掌握</span><strong>${state.mastered.size}</strong></article>
    <article class="stat-card"><span>待复习</span><strong>${state.review.size}</strong></article>
    <article class="stat-card"><span>练习正确率</span><strong>${accuracy}%</strong></article>
    <div class="empty-state">当前批次还剩 ${remaining.toLocaleString()} 条。学完后，AI会自动续写新的 5000 条继续推送。</div>
  `;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return toast("当前浏览器暂不支持语音播放。");
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.accent;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function parseTable(text) {
  const delimiter = text.includes("\t") ? "\t" : ",";
  const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split(delimiter).map((cell) => cell.trim()));
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.toLowerCase());
  const find = (...names) => names.map((name) => headers.indexOf(name)).find((i) => i >= 0);
  const wordIdx = find("word", "english", "term", "单词", "英文");
  const cnIdx = find("chinese", "meaning", "中文", "释义");
  const phraseIdx = find("phrase", "sentence", "语句", "例句");
  const scenarioIdx = find("scenario", "场景");
  const dialogueIdx = find("dialogue", "对话");
  return rows.slice(1).map((row, index) => {
    const word = row[wordIdx] || row[0];
    if (!word) return null;
    const chinese = row[cnIdx] || "自定义导入释义";
    const phrase = row[phraseIdx] || `We need to discuss ${word} in the next meeting.`;
    const scenario = row[scenarioIdx] || "自定义场景";
    const dialogue = row[dialogueIdx] || `A: Could you explain ${word}?\nB: Sure, it is important in our ${state.profile?.industry || "business"} workflow.`;
    return {
      id: `import-${Date.now()}-${index}`,
      source: "表格导入",
      batch: "自定义",
      word,
      chinese,
      phrase,
      phraseCn: "这是你导入内容生成的练习语句。",
      scenario,
      dialogue,
      dialogueCn: "这是你导入内容生成的情景对话。",
      serial: state.bank.length + index + 1
    };
  }).filter(Boolean);
}

function startGame() {
  const group = currentGroup();
  if (!group.length) return toast("先生成词库再开始练习。");
  const item = group[Math.floor(Math.random() * group.length)];
  state.gameAnswer = item;
  state.gameTotal += 1;
  if (state.gameMode === "match") {
    const options = [item];
    while (options.length < Math.min(4, group.length)) {
      const candidate = group[Math.floor(Math.random() * group.length)];
      if (!options.some((option) => option.id === candidate.id)) options.push(candidate);
    }
    els.gamePrompt.innerHTML = `<strong>${escapeHtml(item.chinese)}</strong><br>选择对应英文表达。`;
    els.gameOptions.innerHTML = options.sort(() => Math.random() - 0.5).map((option) => `<button class="option-btn" data-answer="${option.id}" type="button">${escapeHtml(option.word)}</button>`).join("");
    return;
  }
  if (state.gameMode === "fill") {
    const words = item.phrase.split(" ");
    const hidden = Math.min(words.length - 1, Math.max(0, Math.floor(words.length / 2)));
    state.gameAnswer.blank = words[hidden].replace(/[,.?!]/g, "");
    words[hidden] = "_____";
    els.gamePrompt.innerHTML = `${escapeHtml(words.join(" "))}<br><small>${escapeHtml(item.phraseCn)}</small>`;
    els.gameOptions.innerHTML = `<input id="blankInput" placeholder="填入缺失单词" /><button class="option-btn" data-blank="1" type="button">提交</button>`;
    return;
  }
  const dialogue = item.dialogue.split("\n");
  els.gamePrompt.innerHTML = `${escapeHtml(dialogue[0])}<br><strong>补全下一句：</strong>`;
  els.gameOptions.innerHTML = `<textarea id="dialogueInput" rows="3" placeholder="输入你会如何回应"></textarea><button class="option-btn" data-dialogue="1" type="button">提交对话</button>`;
}

function finishGame(correct) {
  if (correct) {
    state.gameScore += 1;
    state.mastered.add(state.gameAnswer.id);
    toast("回答正确，已计入掌握。");
  } else {
    state.review.add(state.gameAnswer.id);
    toast("已加入复习库，会为你反复巩固。");
  }
  save();
  renderShell();
}

document.querySelector("#profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = normalize(document.querySelector("#nameInput").value, "学习者");
  const industry = normalize(document.querySelector("#industryInput").value, "");
  const product = normalize(document.querySelector("#productInput").value, "");
  if (!industry || !product) return toast("请填写你的行业和产品，AI才能生成专业内容。");
  state.profile = { name, industry, product };
  state.imported = [];
  state.generatedBatches = 0;
  state.bank = [];
  state.cursor = 0;
  state.mastered.clear();
  state.review.clear();
  save();
  document.querySelector("#setupModal").classList.add("hidden");
  generateBatch();
});

document.querySelector("#openSetupBtn").addEventListener("click", () => {
  document.querySelector("#setupModal").classList.remove("hidden");
});

document.querySelector("#closeSetupBtn").addEventListener("click", () => {
  if (state.profile) document.querySelector("#setupModal").classList.add("hidden");
  else toast("请先填写行业和产品。");
});

document.querySelector("#generateBtn").addEventListener("click", () => {
  if (!state.profile) return document.querySelector("#setupModal").classList.remove("hidden");
  generateBatch();
});

document.querySelector("#nextGroupBtn").addEventListener("click", () => advanceGroup(true));

document.querySelector(".tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (!tab) return;
  state.tab = tab.dataset.tab;
  document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button === tab));
  render();
});

document.querySelector(".accent-toggle").addEventListener("click", (event) => {
  const button = event.target.closest("[data-accent]");
  if (!button) return;
  state.accent = button.dataset.accent;
  save();
  renderShell();
});

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

els.cards.addEventListener("click", (event) => {
  const speakBtn = event.target.closest("[data-speak]");
  if (speakBtn) return speak(speakBtn.dataset.speak);
  const master = event.target.closest("[data-master]");
  if (master) {
    state.mastered.add(master.dataset.master);
    state.review.delete(master.dataset.master);
    if (groupDoneCount() >= GROUP_SIZE) advanceGroup(true);
    save();
    render();
    return;
  }
  const review = event.target.closest("[data-review]");
  if (review) {
    state.review.add(review.dataset.review);
    save();
    render();
    return;
  }
  const expand = event.target.closest("[data-expand]");
  if (expand) {
    const detail = document.querySelector(`[data-detail="${expand.dataset.expand}"]`);
    detail?.classList.toggle("hidden");
  }
});

els.cards.addEventListener("input", (event) => {
  const note = event.target.closest("[data-note]");
  if (!note) return;
  state.notes[note.dataset.note] = note.value;
  save();
});

document.querySelector("#customForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const word = normalize(document.querySelector("#customWord").value, "");
  const chinese = normalize(document.querySelector("#customChinese").value, "");
  const phrase = normalize(document.querySelector("#customPhrase").value, `We need to discuss ${word}.`);
  if (!word || !chinese) return toast("请至少填写专业单词和中文释义。");
  const item = {
    id: `custom-${Date.now()}`,
    source: "手动添加",
    batch: "自定义",
    word,
    chinese,
    phrase,
    phraseCn: "这是你手动添加的重点表达。",
    scenario: "个人重点",
    dialogue: `A: Could you explain ${word}?\nB: Sure. ${phrase}`,
    dialogueCn: `A：你能解释 ${word} 吗？\nB：可以。${chinese}`,
    serial: state.bank.length + 1
  };
  state.imported.unshift(item);
  rebuildBank();
  event.target.reset();
  save();
  toast("已加入持续练习库，会参与后续学习组、复习和互动练习。");
  render();
});

document.querySelector("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  const imported = parseTable(text);
  state.imported = imported.concat(state.imported);
  rebuildBank();
  state.cursor = 0;
  save();
  toast(`已导入 ${imported.length} 条学习素材。`);
  render();
});

document.querySelector(".game-mode").addEventListener("click", (event) => {
  const button = event.target.closest("[data-game]");
  if (!button) return;
  state.gameMode = button.dataset.game;
  document.querySelectorAll(".mode-btn").forEach((item) => item.classList.toggle("active", item === button));
  els.gameOptions.innerHTML = "";
  els.gamePrompt.textContent = state.gameMode === "match" ? "从当前学习组抽题，答错会自动进入复习库。" : state.gameMode === "fill" ? "根据语句上下文填入缺失词，强化表达记忆。" : "补全真实业务对话，练习场景沟通。";
});

document.querySelector("#startGameBtn").addEventListener("click", startGame);

els.gameOptions.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  if (answer) return finishGame(answer.dataset.answer === state.gameAnswer.id);
  if (event.target.closest("[data-blank]")) {
    const value = normalize(document.querySelector("#blankInput").value, "").toLowerCase();
    return finishGame(value === state.gameAnswer.blank.toLowerCase());
  }
  if (event.target.closest("[data-dialogue]")) {
    const value = normalize(document.querySelector("#dialogueInput").value, "");
    return finishGame(value.length >= 12);
  }
});

rebuildBank();
render();
if (!state.profile) {
  document.querySelector("#setupModal").classList.remove("hidden");
}
