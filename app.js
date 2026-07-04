const GROUP_SIZE = 10;
const BUFFER_SIZE = 40;

const BUSINESS_ROOTS = [
  { term: "compliance check", cn: "鍚堣妫€鏌?, desc: "纭娴佺▼銆佹枃浠舵垨瑕佹眰鏄惁绗﹀悎鏍囧噯" },
  { term: "specification sheet", cn: "瑙勬牸璇存槑", desc: "瑙ｉ噴浜у搧鍙傛暟銆佹€ц兘鎸囨爣鍜岃竟鐣屾潯浠? },
  { term: "quotation", cn: "鎶ヤ环", desc: "璇存槑浠锋牸銆佷氦鏈熷拰鍟嗗姟鏉℃" },
  { term: "installation plan", cn: "瀹夎鏂规", desc: "瀹夋帓閮ㄧ讲銆佽皟璇曞拰鐜板満鏀寔" },
  { term: "maintenance service", cn: "缁存姢鏈嶅姟", desc: "澶勭悊淇濆吇銆佹晠闅滈闃插拰鍞悗璺熻繘" },
  { term: "warranty period", cn: "淇濅慨鏈?, desc: "璇存槑淇濅慨鑼冨洿銆佹椂闀垮拰璐ｄ换杈圭晫" },
  { term: "customization request", cn: "瀹氬埗闇€姹?, desc: "鏍规嵁瀹㈡埛鍦烘櫙璋冩暣鏂规鎴栭厤缃? },
  { term: "integration plan", cn: "闆嗘垚鏂规", desc: "璁╀骇鍝佸拰瀹㈡埛鐜版湁绯荤粺鍗忓悓宸ヤ綔" },
  { term: "inspection report", cn: "妫€楠屾姤鍛?, desc: "纭璐ㄩ噺銆佸姛鑳藉拰浜や粯鐘舵€? },
  { term: "certification document", cn: "璁よ瘉鏂囦欢", desc: "鍑嗗璇佷功銆佹祴璇曠粨鏋滃拰鍑嗗叆璧勬枡" },
  { term: "procurement workflow", cn: "閲囪喘娴佺▼", desc: "娌熼€氶绠椼€佸鎵瑰拰涓嬪崟姝ラ" },
  { term: "delivery schedule", cn: "浜や粯璁″垝", desc: "纭鍙戣揣銆佸畨瑁呭拰楠屾敹鑺傜偣" },
  { term: "technical proposal", cn: "鎶€鏈柟妗?, desc: "灞曠ず瑙ｅ喅璺緞鍜屽疄鏂界粏鑺? },
  { term: "cost breakdown", cn: "鎴愭湰鏄庣粏", desc: "鎷嗚В璐圭敤鏋勬垚骞惰В閲婃姤浠蜂緷鎹? },
  { term: "service agreement", cn: "鏈嶅姟鍗忚", desc: "鏄庣‘鍝嶅簲鏃堕棿銆佽寖鍥村拰璐ｄ换" }
];

const CABLE_TERMS = [
  { term: "conductor", cn: "瀵间綋", desc: "鎺у埗瀵间綋鐩村緞鍜岀數姘旀€ц兘" },
  { term: "insulation", cn: "缁濈紭灞?, desc: "淇濇寔缁濈紭鍧囧寑銆佹病鏈夐拡瀛? },
  { term: "extrusion line", cn: "鎸ゅ嚭鐢熶骇绾?, desc: "鐢ㄤ簬鎸ゅ嚭缁濈紭灞傛垨鎶ゅ" },
  { term: "extruder", cn: "鎸ゅ嚭鏈?, desc: "鎺у埗铻烘潌銆佹枡绛掑拰娓╁害鍖? },
  { term: "extrusion die", cn: "鎸ゅ嚭妯″叿", desc: "鍐冲畾澶栧緞鍜屾垚鍨嬬簿搴? },
  { term: "die head", cn: "妯″ご", desc: "鍦ㄥ紑鏈哄墠瀹屾垚涓績璋冭瘯" },
  { term: "temperature zone", cn: "娓╂帶鍖?, desc: "鎸夌収鏉愭枡瑕佹眰璁惧畾娓╁害" },
  { term: "cooling trough", cn: "鍐峰嵈姘存Ы", desc: "璁╃嚎缂嗙ǔ瀹氶檷娓╂垚鍨? },
  { term: "spark tester", cn: "鐏姳娴嬭瘯鏈?, desc: "妫€鏌ョ粷缂樺眰鏄惁鏈夌己闄? },
  { term: "outer diameter", cn: "澶栧緞", desc: "鍦ㄧ嚎鐩戞帶鎴愬搧灏哄" },
  { term: "eccentricity", cn: "鍋忓績搴?, desc: "鎺у埗缁濈紭灞傚帤搴︽槸鍚﹀潎鍖€" },
  { term: "line speed", cn: "绾块€熷害", desc: "鍦ㄥ伐鑹虹ǔ瀹氬悗閫愭鎻愰€? },
  { term: "pay-off stand", cn: "鏀剧嚎鏋?, desc: "绋冲畾閫佸嚭绾挎潗骞朵繚鎸佸紶鍔? },
  { term: "take-up unit", cn: "鏀剁嚎瑁呯疆", desc: "鎶婃垚鍝佺嚎缂嗘暣榻愭敹鍗? },
  { term: "tension control", cn: "寮犲姏鎺у埗", desc: "闃叉鎷変几鍜屽彉褰? },
  { term: "capstan", cn: "鐗靛紩杞?, desc: "鎻愪緵绋冲畾鐗靛紩鍔? },
  { term: "traverse system", cn: "鎺掔嚎绯荤粺", desc: "璁╃嚎缂嗗潎鍖€鎺掑竷鍦ㄧ嚎鐩樹笂" },
  { term: "single-twist strander", cn: "鍗曠粸鏈?, desc: "鐢熶骇澶氳姱鏌旀€х嚎缂? },
  { term: "cantilever single-twist machine", cn: "鎮噦鍗曠粸鏈?, desc: "鏀寔蹇€熸崲鐩樺拰绋冲畾缁炲悎" },
  { term: "back-twist unit", cn: "閫€鎵缃?, desc: "闃叉绾胯姱鑷壄" }
];

const SCENARIOS = [
  { en: "customer inquiry", cn: "瀹㈡埛棣栨璇环" },
  { en: "product demo", cn: "浜у搧婕旂ず" },
  { en: "technical answer", cn: "鎶€鏈瓟鐤? },
  { en: "quotation negotiation", cn: "鎶ヤ环娌熼€? },
  { en: "contract review", cn: "鍚堝悓纭" },
  { en: "delivery confirmation", cn: "浜や粯纭" },
  { en: "after-sales support", cn: "鍞悗鏀寔" },
  { en: "quality review", cn: "璐ㄩ噺澶嶇洏" },
  { en: "training session", cn: "鍩硅娌熼€? },
  { en: "project kickoff", cn: "椤圭洰鍚姩" }
];

const ACCENT_LABELS = {
  "en-US": "缇庡紡",
  "en-GB": "鑻卞紡"
};

const state = {
  profile: loadJson("aiProfile", null),
  apiConfig: loadJson("aiApiConfig", null),
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
  loading: false,
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

function save() {
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

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value, fallback = "") {
  return String(value || fallback).trim();
}

function detectCableBusiness(industry, product) {
  return /绾跨紗|鐢电紗|鐢电嚎|鎸ゅ嚭|鎶煎嚭|缁炵嚎|鍗曠粸|閫€鎵瓅鏀剧嚎|鏀剁嚎|cable|wire|extrud|strand/i.test(`${industry} ${product}`);
}

function getBaseTerms(industry, product) {
  return detectCableBusiness(industry, product) ? CABLE_TERMS : BUSINESS_ROOTS;
}

function currentProfile() {
  return {
    name: normalize(state.profile?.name, "瀛︿範鑰?),
    industry: normalize(state.profile?.industry, ""),
    product: normalize(state.profile?.product, "")
  };
}

function rebuildBank() {
  state.bank = [...state.imported, ...state.generated];
}

function currentGroup() {
  return state.bank.slice(state.cursor, state.cursor + GROUP_SIZE);
}

function groupDoneCount() {
  return currentGroup().filter((item) => state.mastered.has(item.id)).length;
}

function apiConfigEnabled() {
  return Boolean(state.apiConfig?.enabled && state.apiConfig?.apiKey);
}

function syncApiControls() {
  const config = state.apiConfig || {};
  const defaultModel = config.provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini";
  if (els.useCustomApi) els.useCustomApi.checked = Boolean(config.enabled);
  if (els.apiProvider) els.apiProvider.value = config.provider || "openai";
  if (els.apiKeyInput) els.apiKeyInput.value = config.apiKey || "";
  if (els.apiModelInput) {
    els.apiModelInput.value = config.model || defaultModel;
    els.apiModelInput.placeholder = defaultModel;
  }
  if (els.apiStatusText) {
    els.apiStatusText.textContent = apiConfigEnabled() ? "已启用" : "未启用";
  }
  if (els.apiLine) {
    els.apiLine.textContent = apiConfigEnabled() ? `${config.provider || "OpenAI"} / ${config.model || defaultModel}` : "未连接";
  }
}

function readApiControls() {
  const provider = normalize(els.apiProvider.value, "openai");
  const defaultModel = provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini";
  return {
    enabled: els.useCustomApi.checked,
    provider,
    apiKey: normalize(els.apiKeyInput.value, ""),
    model: normalize(els.apiModelInput.value, defaultModel)
  };
}

async function testApiConnection() {
  const config = readApiControls();
  if (!config.apiKey) {
    toast("璇峰厛濉啓 API Key");
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
    throw new Error(data.error || `API 璇锋眰澶辫触 (${response.status})`);
  }
  if (!Array.isArray(data.items) || !data.items.length) {
    throw new Error("鎺ュ彛杩斿洖涓虹┖");
  }
  state.apiConfig = config;
  save();
  syncApiControls();
}

function toDialogueText(value) {
  if (Array.isArray(value)) {
    return value
      .map((line) => {
        if (!line) return "";
        if (typeof line === "string") return line;
        const role = normalize(line.role, "speaker");
        const text = normalize(line.text, "");
        return `${role}: ${text}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  return normalize(value, "");
}

function normalizeApiItem(item, index, sourceLabel = "AI鐢熸垚") {
  const profile = currentProfile();
  const word = normalize(item.word || item.term || item.english || item.title, "");
  const chinese = normalize(item.chinese || item.meaning || item.translation || item.definition, "");
  const phrase = normalize(item.phrase || item.example || item.exampleSentence || item.sentence, "");
  const phraseCn = normalize(item.phraseCn || item.exampleCn || item.exampleChinese || item.sentenceCn, "");
  const scenario = normalize(item.scenario || item.context || item.scene, "鐪熷疄涓氬姟鍦烘櫙");
  const dialogue = toDialogueText(item.dialogue || item.conversation || item.chat);
  const dialogueCn = toDialogueText(item.dialogueCn || item.conversationCn || item.chatCn);
  const serial = Number(item.serial || state.bank.length + index + 1);

  return {
    id: normalize(item.id, `${sourceLabel.toLowerCase()}-${Date.now()}-${index}`),
    source: normalize(item.source, sourceLabel),
    batch: Number(item.batch) || Math.floor((state.cursor + index) / GROUP_SIZE) + 1,
    word: word || `${profile.product || "product"} term`,
    chinese: chinese || "涓撲笟璇嶄箟寰呭畬鍠?,
    phrase: phrase || `We use ${word || profile.product || "this term"} in ${profile.industry || "our business"} work.`,
    phraseCn: phraseCn || "杩欓噷鏄腑鏂囩ず渚嬪彞锛屾柟渚胯蹇嗐€?,
    scenario,
    dialogue: dialogue || `Customer: Could you explain ${word || profile.product || "this term"}?\nSpecialist: Yes, let me walk you through it.`,
    dialogueCn: dialogueCn || "瀹㈡埛锛氫綘鑳借В閲婁竴涓嬭繖涓瘝鍚楋紵\n涓撳憳锛氬彲浠ワ紝鎴戞潵缁欎綘璇存槑銆?,
    serial
  };
}

function makeLocalItem(index, batchOffset, industry, product) {
  const terms = getBaseTerms(industry, product);
  const roots = terms[index % terms.length];
  const scenario = SCENARIOS[index % SCENARIOS.length];
  const modifier = ["standard", "custom", "real-time", "scalable", "preventive", "certified"][Math.floor(index / 5) % 6];
  const serial = batchOffset + index + 1;
  const term = `${modifier} ${product} ${roots.term}`;
  const phrase = `We need to review the ${term} before the ${scenario.en}.`;
  const phraseCn = `鎴戜滑闇€瑕佸湪${scenario.cn}涔嬪墠纭杩欎釜${roots.cn}鐩稿叧琛ㄨ揪銆俙;
  const dialogue = `Customer: How does your ${product} relate to ${roots.term}?\nSpecialist: We use a ${modifier} workflow to manage ${roots.desc}.`;
  const dialogueCn = `瀹㈡埛锛氫綘浠殑${product}鍜?{roots.cn}鏈変粈涔堝叧绯伙紵\n涓撳憳锛氭垜浠細鐢?{modifier}娴佺▼鏉ュ鐞?{roots.desc}銆俙;
  return {
    id: `local-${serial}`,
    source: "鏈湴鐢熸垚",
    batch: Math.floor(batchOffset / BUFFER_SIZE) + 1,
    word: term,
    chinese: `${product} / ${roots.cn}锛?{industry || "琛屼笟"}鍦烘櫙`,
    phrase,
    phraseCn,
    scenario: scenario.cn,
    dialogue,
    dialogueCn,
    serial
  };
}

async function fetchApiItems(count) {
  if (!apiConfigEnabled()) return [];
  const response = await fetch("/api/generate-learning-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count,
      profile: currentProfile(),
      provider: state.apiConfig.provider,
      apiKey: state.apiConfig.apiKey,
      model: state.apiConfig.model,
      batchOffset: state.bank.length
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API 璇锋眰澶辫触 (${response.status})`);
  }
  return Array.isArray(data.items) ? data.items : [];
}

async function topUpBank(count = BUFFER_SIZE) {
  if (!state.profile) return;
  const industry = normalize(state.profile.industry, "");
  const product = normalize(state.profile.product, "");
  if (!industry || !product) return;

  if (apiConfigEnabled()) {
    const apiItems = await fetchApiItems(count);
    if (apiItems.length) {
      state.generated = state.generated.concat(apiItems.map((item, index) => normalizeApiItem(item, index)));
    }
  } else {
    const batchOffset = state.generated.length;
    const localItems = Array.from({ length: count }, (_, index) => makeLocalItem(index, batchOffset, industry, product));
    state.generated = state.generated.concat(localItems);
  }

  rebuildBank();
  save();
  renderShell();
}

function escapeForText(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderShell() {
  syncApiControls();
  const profile = currentProfile();
  els.profileLine.textContent = state.profile ? `${profile.name} 路 ${profile.industry} 路 ${profile.product}` : "杈撳叆琛屼笟涓庝骇鍝佸悗寮€濮嬬敓鎴?;
  els.industryLine.textContent = profile.industry || "鏈缃?;
  els.productLine.textContent = profile.product || "鏈缃?;
  els.bankLine.textContent = `${state.bank.length.toLocaleString()} 鏉;
  els.masteredLine.textContent = String(state.mastered.size);
  els.reviewLine.textContent = String(state.review.size);
  els.planTitle.textContent = state.profile ? `${profile.industry} / ${profile.product} 涓撲笟鑻辫寰幆瀛︿範` : "鍏堣缃綘鐨勮涓氬拰浜у搧";

  const done = groupDoneCount();
  const percent = Math.round((done / GROUP_SIZE) * 100);
  els.groupLine.textContent = `${done} / ${GROUP_SIZE}`;
  els.progressText.textContent = `${percent}%`;
  els.progressCircle.style.strokeDashoffset = `${314 - (314 * percent) / 100}`;
  els.progressHint.textContent = percent >= 100 ? "鏈粍宸插畬鎴愶紝涓嬩竴缁勫唴瀹瑰凡鍑嗗濂姐€? : "瀛﹀畬杩欎竴缁勫悗锛岀郴缁熶細鑷姩鎺ㄩ€佷笅涓€缁勩€?;

  document.querySelectorAll(".accent-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.accent === state.accent);
  });
}

function renderCards(items, compact = false) {
  if (!items.length) {
    els.cards.innerHTML = `<div class="empty-state">鏆傛棤鍐呭銆備綘鍙互瀵煎叆琛ㄦ牸銆佹墜鍔ㄦ坊鍔狅紝鎴栬€呯偣鍑荤敓鎴愭柊鍐呭銆?/div>`;
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const mastered = state.mastered.has(item.id);
      const reviewing = state.review.has(item.id);
      const note = state.notes[item.id] || "";
      return `
        <article class="card ai-card">
          <div class="card-topline">
            <span class="tag">${escapeHtml(item.source)} 路 绗?${item.batch || 1} 鎵?路 ${escapeHtml(item.scenario)}</span>
            <button class="mini-btn" data-expand="${escapeHtml(item.id)}" type="button">${compact ? "鏌ョ湅" : "鍦烘櫙"}</button>
          </div>
          <strong>${escapeHtml(item.word)}</strong>
          <p class="translation">${escapeHtml(item.chinese)}</p>
          <div class="scenario-box ${compact ? "hidden" : ""}" data-detail="${escapeHtml(item.id)}">
            <p><b>鍦烘櫙鍙ワ細</b>${escapeHtml(item.phrase)}</p>
            <p>${escapeHtml(item.phraseCn)}</p>
            <p><b>瀵硅瘽锛?/b>${escapeForText(item.dialogue)}</p>
            <p>${escapeForText(item.dialogueCn)}</p>
          </div>
          <textarea class="note-input" data-note="${escapeHtml(item.id)}" rows="2" placeholder="娣诲姞鑷繁鐨勮蹇嗙瑪璁?>${escapeHtml(note)}</textarea>
          <div class="card-actions">
            <button class="sound-btn" data-speak="${escapeHtml(item.word)}" type="button">璇诲崟璇?/button>
            <button class="sound-btn" data-speak="${escapeHtml(item.phrase)}" type="button">璇诲彞瀛?/button>
            <button class="mastered-btn ${mastered ? "done" : ""}" data-master="${escapeHtml(item.id)}" type="button">${mastered ? "宸叉帉鎻? : "鎺屾彙"}</button>
            <button class="unknown-btn ${reviewing ? "done" : ""}" data-review="${escapeHtml(item.id)}" type="button">${reviewing ? "澶嶄範涓? : "鍔犲叆澶嶄範"}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGameIntro() {
  els.cards.innerHTML = `
    <div class="empty-state">
      鍙充晶灏忔父鎴忎細浠庡綋鍓嶅涔犵粍鎶介锛氳瘝涔夊揩閫夈€佸彞瀛愬～绌哄拰鐪熷疄瀵硅瘽琛ュ叏銆?    </div>
  `;
}

function renderStats() {
  const accuracy = state.gameTotal ? Math.round((state.gameScore / state.gameTotal) * 100) : 0;
  const remaining = Math.max(0, state.bank.length - state.cursor);
  els.cards.innerHTML = `
    <article class="stat-card"><span>璇嶅簱鎬婚噺</span><strong>${state.bank.length.toLocaleString()}</strong></article>
    <article class="stat-card"><span>宸叉帉鎻?/span><strong>${state.mastered.size}</strong></article>
    <article class="stat-card"><span>寰呭涔?/span><strong>${state.review.size}</strong></article>
    <article class="stat-card"><span>灏忔父鎴忔纭巼</span><strong>${accuracy}%</strong></article>
    <div class="empty-state">褰撳墠杩樺墿 ${remaining.toLocaleString()} 鏉″彲瀛﹀唴瀹广€傚瀹屽悗绯荤粺浼氱户缁ˉ鍏呬笅涓€鎵广€?/div>
  `;
}

function render() {
  renderShell();
  const [title, subtitle] = {
    learn: ["浠婃棩瀛︿範缁?, "姣忕粍 10 鏉★紝鍖呭惈鍗曡瘝銆佸満鏅彞鍜屽璇濄€?],
    review: ["澶嶄範鍐呭", "绛旈敊鎴栧姞鍏ュ涔犵殑鍐呭浼氬湪杩欓噷閲嶅鍑虹幇銆?],
    games: ["浜掑姩缁冧範", "鐢ㄥ綋鍓嶅涔犵粍鍋氬揩閫夈€佸～绌哄拰瀵硅瘽琛ュ叏銆?],
    bank: ["璇嶅簱鎬昏", "鏌ョ湅 AI 鐢熸垚鍜屼綘瀵煎叆鐨勫叏閮ㄥ唴瀹广€?],
    stats: ["鏁版嵁鐪嬫澘", "鏌ョ湅鎺屾彙閲忋€佸涔犻噺鍜屽涔犳纭巼銆?]
  }[state.tab];

  els.sectionTitle.textContent = title;
  els.sectionSubtitle.textContent = subtitle;

  if (!state.profile || !state.bank.length) {
    els.cards.innerHTML = `<div class="empty-state">鍏堝～鍐欒涓氬拰浜у搧锛岀劧鍚庣偣鍑烩€滅敓鎴愭垜鐨?AI 涓撲笟璇嶅簱鈥濄€?/div>`;
    return;
  }

  if (state.tab === "learn") return renderCards(filtered(currentGroup()));
  if (state.tab === "review") return renderCards(filtered(state.bank.filter((item) => state.review.has(item.id))));
  if (state.tab === "bank") return renderCards(filtered(state.bank).slice(0, 80), true);
  if (state.tab === "games") return renderGameIntro();
  renderStats();
}

function filtered(items) {
  const q = state.search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    return `${item.word} ${item.chinese} ${item.phrase} ${item.phraseCn} ${item.scenario} ${item.dialogue} ${item.dialogueCn}`
      .toLowerCase()
      .includes(q);
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    toast("褰撳墠娴忚鍣ㄤ笉鏀寔璇煶鎾斁");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.accent;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
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
  const find = (...names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const wordIdx = find("word", "english", "term", "鍗曡瘝", "鑻辨枃");
  const cnIdx = find("chinese", "meaning", "涓枃", "閲婁箟");
  const phraseIdx = find("phrase", "sentence", "鍙ュ瓙", "渚嬪彞");
  const scenarioIdx = find("scenario", "鍦烘櫙");
  const dialogueIdx = find("dialogue", "瀵硅瘽");

  return rows.slice(1).map((row, index) => {
    const word = row[wordIdx] || row[0];
    if (!word) return null;
    return {
      id: `import-${Date.now()}-${index}`,
      source: "琛ㄦ牸瀵煎叆",
      batch: "鑷畾涔?,
      word,
      chinese: row[cnIdx] || "鑷畾涔夐噴涔?,
      phrase: row[phraseIdx] || `We need to discuss ${word}.`,
      phraseCn: "杩欐槸瀵煎叆鍐呭鑷姩琛ュ厖鐨勪腑鏂囧彞瀛愩€?,
      scenario: row[scenarioIdx] || "鑷畾涔夊満鏅?,
      dialogue: row[dialogueIdx] || `A: Could you explain ${word}?\nB: Sure, it is important in our workflow.`,
      dialogueCn: "杩欐槸瀵煎叆鍐呭鑷姩琛ュ厖鐨勫璇濄€?,
      serial: state.bank.length + index + 1
    };
  }).filter(Boolean);
}

function setGamePrompt() {
  if (state.gameMode === "match") {
    els.gamePrompt.textContent = "浠庡綋鍓嶅涔犵粍閲屽揩閫熸壘鍑哄搴旇嫳鏂囥€?;
  } else if (state.gameMode === "fill") {
    els.gamePrompt.textContent = "鏍规嵁涓婁笅鏂囪ˉ鍏ㄧ己澶卞崟璇嶃€?;
  } else {
    els.gamePrompt.textContent = "琛ュ叏鐪熷疄涓氬姟瀵硅瘽涓殑涓嬩竴鍙ャ€?;
  }
}

function startGame() {
  const group = currentGroup();
  if (!group.length) {
    toast("鍏堢敓鎴愪竴缁勫唴瀹瑰啀寮€濮嬪皬娓告垙銆?);
    return;
  }
  const item = group[Math.floor(Math.random() * group.length)];
  state.gameAnswer = item;
  state.gameTotal += 1;

  if (state.gameMode === "match") {
    const options = [item];
    while (options.length < Math.min(4, group.length)) {
      const candidate = group[Math.floor(Math.random() * group.length)];
      if (!options.some((option) => option.id === candidate.id)) options.push(candidate);
    }
    els.gamePrompt.innerHTML = `<strong>${escapeHtml(item.chinese)}</strong><br>璇烽€夋嫨瀵瑰簲鑻辨枃銆俙;
    els.gameOptions.innerHTML = options
      .sort(() => Math.random() - 0.5)
      .map((option) => `<button class="option-btn" data-answer="${escapeHtml(option.id)}" type="button">${escapeHtml(option.word)}</button>`)
      .join("");
    return;
  }

  if (state.gameMode === "fill") {
    const words = item.phrase.split(" ");
    const hiddenIndex = Math.max(0, Math.min(words.length - 1, Math.floor(words.length / 2)));
    state.gameAnswer.blank = words[hiddenIndex].replace(/[,.?!]/g, "");
    words[hiddenIndex] = "_____";
    els.gamePrompt.innerHTML = `${escapeHtml(words.join(" "))}<br><small>${escapeHtml(item.phraseCn)}</small>`;
    els.gameOptions.innerHTML = `
      <input id="blankInput" placeholder="璇疯緭鍏ョ己澶卞崟璇? />
      <button class="option-btn" data-blank="1" type="button">鎻愪氦</button>
    `;
    return;
  }

  const dialogue = item.dialogue.split("\n");
  els.gamePrompt.innerHTML = `${escapeHtml(dialogue[0])}<br><strong>琛ュ叏涓嬩竴鍙ワ細</strong>`;
  els.gameOptions.innerHTML = `
    <textarea id="dialogueInput" rows="3" placeholder="杈撳叆浣犱細鎬庝箞鍥炲簲"></textarea>
    <button class="option-btn" data-dialogue="1" type="button">鎻愪氦瀵硅瘽</button>
  `;
}

function finishGame(correct) {
  if (correct) {
    state.gameScore += 1;
    state.mastered.add(state.gameAnswer.id);
    toast("鍥炵瓟姝ｇ‘锛屽凡璁″叆鎺屾彙銆?);
  } else {
    state.review.add(state.gameAnswer.id);
    toast("宸插姞鍏ュ涔犲簱銆?);
  }
  save();
  renderShell();
}

async function advanceGroup(force = false) {
  const group = currentGroup();
  if (!force && group.some((item) => !state.mastered.has(item.id))) {
    toast("杩欎竴缁勮繕鏈夊唴瀹规病鎺屾彙锛屼篃鍙互缁х画鎺ㄨ繘銆?);
  }
  state.cursor += GROUP_SIZE;
  if (state.cursor + GROUP_SIZE > state.bank.length) {
    await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  }
  save();
  render();
}

function markApiStateFromForm() {
  state.apiConfig = readApiControls();
  save();
  syncApiControls();
}

document.querySelector("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = normalize(document.querySelector("#nameInput").value, "瀛︿範鑰?);
  const industry = normalize(document.querySelector("#industryInput").value, "");
  const product = normalize(document.querySelector("#productInput").value, "");
  if (!industry || !product) {
    toast("璇峰厛濉啓琛屼笟鍜屼骇鍝併€?);
    return;
  }

  state.profile = { name, industry, product };
  state.imported = [];
  state.generated = [];
  state.mastered.clear();
  state.review.clear();
  state.notes = {};
  state.cursor = 0;
  markApiStateFromForm();
  save();
  document.querySelector("#setupModal").classList.add("hidden");
  await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  render();
});

document.querySelector("#openSetupBtn").addEventListener("click", () => {
  syncApiControls();
  document.querySelector("#setupModal").classList.remove("hidden");
});

document.querySelector("#closeSetupBtn").addEventListener("click", () => {
  if (state.profile) {
    document.querySelector("#setupModal").classList.add("hidden");
  } else {
    toast("璇峰厛濉啓琛屼笟鍜屼骇鍝併€?);
  }
});

els.testApiBtn.addEventListener("click", async () => {
  try {
    await testApiConnection();
    toast("API 杩炴帴鎴愬姛");
  } catch (error) {
    toast(error.message || "API 杩炴帴澶辫触");
  }
});

document.querySelector("#generateBtn").addEventListener("click", async () => {
  if (!state.profile) {
    document.querySelector("#setupModal").classList.remove("hidden");
    return;
  }
  await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  toast(apiConfigEnabled() ? "宸查€氳繃浣犵殑 API 缁啓涓€鎵瑰唴瀹广€? : "宸茬敓鎴愭柊鐨勫涔犲唴瀹广€?);
  render();
});

document.querySelector("#nextGroupBtn").addEventListener("click", async () => {
  await advanceGroup(true);
});

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.tab = button.dataset.tab;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
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

els.cards.addEventListener("click", async (event) => {
  const speakBtn = event.target.closest("[data-speak]");
  if (speakBtn) {
    speak(speakBtn.dataset.speak);
    return;
  }

  const masterBtn = event.target.closest("[data-master]");
  if (masterBtn) {
    state.mastered.add(masterBtn.dataset.master);
    state.review.delete(masterBtn.dataset.master);
    save();
    render();
    if (groupDoneCount() >= GROUP_SIZE) {
      await advanceGroup(true);
    }
    return;
  }

  const reviewBtn = event.target.closest("[data-review]");
  if (reviewBtn) {
    state.review.add(reviewBtn.dataset.review);
    save();
    render();
    return;
  }

  const expandBtn = event.target.closest("[data-expand]");
  if (expandBtn) {
    const detail = document.querySelector(`[data-detail="${expandBtn.dataset.expand}"]`);
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
  if (!word || !chinese) {
    toast("璇疯嚦灏戝～鍐欏崟璇嶅拰涓枃閲婁箟銆?);
    return;
  }

  state.imported.unshift({
    id: `custom-${Date.now()}`,
    source: "鎵嬪姩娣诲姞",
    batch: "鑷畾涔?,
    word,
    chinese,
    phrase,
    phraseCn: "杩欐槸浣犳墜鍔ㄦ坊鍔犵殑閲嶇偣琛ㄨ揪銆?,
    scenario: "涓汉閲嶇偣",
    dialogue: `A: Could you explain ${word}?\nB: Sure. ${phrase}`,
    dialogueCn: `A锛氫綘鑳借В閲婁竴涓?{word}鍚楋紵\nB锛氬彲浠ャ€?{chinese}`,
    serial: state.bank.length + 1
  });

  rebuildBank();
  event.target.reset();
  save();
  toast("宸插姞鍏ユ寔缁粌涔犲簱銆?);
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
  toast(`宸插鍏?${imported.length} 鏉″涔犵礌鏉愩€俙);
  render();
});

document.querySelector(".game-mode").addEventListener("click", (event) => {
  const button = event.target.closest("[data-game]");
  if (!button) return;
  state.gameMode = button.dataset.game;
  document.querySelectorAll(".mode-btn").forEach((item) => item.classList.toggle("active", item === button));
  els.gameOptions.innerHTML = "";
  setGamePrompt();
});

document.querySelector("#startGameBtn").addEventListener("click", startGame);

els.gameOptions.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  if (answer) {
    finishGame(answer.dataset.answer === state.gameAnswer.id);
    return;
  }

  if (event.target.closest("[data-blank]")) {
    const value = normalize(document.querySelector("#blankInput").value, "").toLowerCase();
    finishGame(value === normalize(state.gameAnswer.blank, "").toLowerCase());
    return;
  }

  if (event.target.closest("[data-dialogue]")) {
    const value = normalize(document.querySelector("#dialogueInput").value, "");
    finishGame(value.length >= 12);
  }
});

document.querySelector(".accent-toggle")?.addEventListener("keydown", () => {});

rebuildBank();
syncApiControls();
render();

if (state.profile && !state.bank.length) {
  void topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
}

if (!state.profile) {
  document.querySelector("#setupModal").classList.remove("hidden");
}
﻿const GROUP_SIZE = 10;
const BUFFER_SIZE = 40;

const BUSINESS_ROOTS = [
  { term: "compliance check", cn: "鍚堣妫€鏌?, desc: "纭娴佺▼銆佹枃浠舵垨瑕佹眰鏄惁绗﹀悎鏍囧噯" },
  { term: "specification sheet", cn: "瑙勬牸璇存槑", desc: "瑙ｉ噴浜у搧鍙傛暟銆佹€ц兘鎸囨爣鍜岃竟鐣屾潯浠? },
  { term: "quotation", cn: "鎶ヤ环", desc: "璇存槑浠锋牸銆佷氦鏈熷拰鍟嗗姟鏉℃" },
  { term: "installation plan", cn: "瀹夎鏂规", desc: "瀹夋帓閮ㄧ讲銆佽皟璇曞拰鐜板満鏀寔" },
  { term: "maintenance service", cn: "缁存姢鏈嶅姟", desc: "澶勭悊淇濆吇銆佹晠闅滈闃插拰鍞悗璺熻繘" },
  { term: "warranty period", cn: "淇濅慨鏈?, desc: "璇存槑淇濅慨鑼冨洿銆佹椂闀垮拰璐ｄ换杈圭晫" },
  { term: "customization request", cn: "瀹氬埗闇€姹?, desc: "鏍规嵁瀹㈡埛鍦烘櫙璋冩暣鏂规鎴栭厤缃? },
  { term: "integration plan", cn: "闆嗘垚鏂规", desc: "璁╀骇鍝佸拰瀹㈡埛鐜版湁绯荤粺鍗忓悓宸ヤ綔" },
  { term: "inspection report", cn: "妫€楠屾姤鍛?, desc: "纭璐ㄩ噺銆佸姛鑳藉拰浜や粯鐘舵€? },
  { term: "certification document", cn: "璁よ瘉鏂囦欢", desc: "鍑嗗璇佷功銆佹祴璇曠粨鏋滃拰鍑嗗叆璧勬枡" },
  { term: "procurement workflow", cn: "閲囪喘娴佺▼", desc: "娌熼€氶绠椼€佸鎵瑰拰涓嬪崟姝ラ" },
  { term: "delivery schedule", cn: "浜や粯璁″垝", desc: "纭鍙戣揣銆佸畨瑁呭拰楠屾敹鑺傜偣" },
  { term: "technical proposal", cn: "鎶€鏈柟妗?, desc: "灞曠ず瑙ｅ喅璺緞鍜屽疄鏂界粏鑺? },
  { term: "cost breakdown", cn: "鎴愭湰鏄庣粏", desc: "鎷嗚В璐圭敤鏋勬垚骞惰В閲婃姤浠蜂緷鎹? },
  { term: "service agreement", cn: "鏈嶅姟鍗忚", desc: "鏄庣‘鍝嶅簲鏃堕棿銆佽寖鍥村拰璐ｄ换" }
];

const CABLE_TERMS = [
  { term: "conductor", cn: "瀵间綋", desc: "鎺у埗瀵间綋鐩村緞鍜岀數姘旀€ц兘" },
  { term: "insulation", cn: "缁濈紭灞?, desc: "淇濇寔缁濈紭鍧囧寑銆佹病鏈夐拡瀛? },
  { term: "extrusion line", cn: "鎸ゅ嚭鐢熶骇绾?, desc: "鐢ㄤ簬鎸ゅ嚭缁濈紭灞傛垨鎶ゅ" },
  { term: "extruder", cn: "鎸ゅ嚭鏈?, desc: "鎺у埗铻烘潌銆佹枡绛掑拰娓╁害鍖? },
  { term: "extrusion die", cn: "鎸ゅ嚭妯″叿", desc: "鍐冲畾澶栧緞鍜屾垚鍨嬬簿搴? },
  { term: "die head", cn: "妯″ご", desc: "鍦ㄥ紑鏈哄墠瀹屾垚涓績璋冭瘯" },
  { term: "temperature zone", cn: "娓╂帶鍖?, desc: "鎸夌収鏉愭枡瑕佹眰璁惧畾娓╁害" },
  { term: "cooling trough", cn: "鍐峰嵈姘存Ы", desc: "璁╃嚎缂嗙ǔ瀹氶檷娓╂垚鍨? },
  { term: "spark tester", cn: "鐏姳娴嬭瘯鏈?, desc: "妫€鏌ョ粷缂樺眰鏄惁鏈夌己闄? },
  { term: "outer diameter", cn: "澶栧緞", desc: "鍦ㄧ嚎鐩戞帶鎴愬搧灏哄" },
  { term: "eccentricity", cn: "鍋忓績搴?, desc: "鎺у埗缁濈紭灞傚帤搴︽槸鍚﹀潎鍖€" },
  { term: "line speed", cn: "绾块€熷害", desc: "鍦ㄥ伐鑹虹ǔ瀹氬悗閫愭鎻愰€? },
  { term: "pay-off stand", cn: "鏀剧嚎鏋?, desc: "绋冲畾閫佸嚭绾挎潗骞朵繚鎸佸紶鍔? },
  { term: "take-up unit", cn: "鏀剁嚎瑁呯疆", desc: "鎶婃垚鍝佺嚎缂嗘暣榻愭敹鍗? },
  { term: "tension control", cn: "寮犲姏鎺у埗", desc: "闃叉鎷変几鍜屽彉褰? },
  { term: "capstan", cn: "鐗靛紩杞?, desc: "鎻愪緵绋冲畾鐗靛紩鍔? },
  { term: "traverse system", cn: "鎺掔嚎绯荤粺", desc: "璁╃嚎缂嗗潎鍖€鎺掑竷鍦ㄧ嚎鐩樹笂" },
  { term: "single-twist strander", cn: "鍗曠粸鏈?, desc: "鐢熶骇澶氳姱鏌旀€х嚎缂? },
  { term: "cantilever single-twist machine", cn: "鎮噦鍗曠粸鏈?, desc: "鏀寔蹇€熸崲鐩樺拰绋冲畾缁炲悎" },
  { term: "back-twist unit", cn: "閫€鎵缃?, desc: "闃叉绾胯姱鑷壄" }
];

const SCENARIOS = [
  { en: "customer inquiry", cn: "瀹㈡埛棣栨璇环" },
  { en: "product demo", cn: "浜у搧婕旂ず" },
  { en: "technical answer", cn: "鎶€鏈瓟鐤? },
  { en: "quotation negotiation", cn: "鎶ヤ环娌熼€? },
  { en: "contract review", cn: "鍚堝悓纭" },
  { en: "delivery confirmation", cn: "浜や粯纭" },
  { en: "after-sales support", cn: "鍞悗鏀寔" },
  { en: "quality review", cn: "璐ㄩ噺澶嶇洏" },
  { en: "training session", cn: "鍩硅娌熼€? },
  { en: "project kickoff", cn: "椤圭洰鍚姩" }
];

const ACCENT_LABELS = {
  "en-US": "缇庡紡",
  "en-GB": "鑻卞紡"
};

const state = {
  profile: loadJson("aiProfile", null),
  apiConfig: loadJson("aiApiConfig", null),
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
  loading: false,
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

function save() {
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

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value, fallback = "") {
  return String(value || fallback).trim();
}

function detectCableBusiness(industry, product) {
  return /绾跨紗|鐢电紗|鐢电嚎|鎸ゅ嚭|鎶煎嚭|缁炵嚎|鍗曠粸|閫€鎵瓅鏀剧嚎|鏀剁嚎|cable|wire|extrud|strand/i.test(`${industry} ${product}`);
}

function getBaseTerms(industry, product) {
  return detectCableBusiness(industry, product) ? CABLE_TERMS : BUSINESS_ROOTS;
}

function currentProfile() {
  return {
    name: normalize(state.profile?.name, "瀛︿範鑰?),
    industry: normalize(state.profile?.industry, ""),
    product: normalize(state.profile?.product, "")
  };
}

function rebuildBank() {
  state.bank = [...state.imported, ...state.generated];
}

function currentGroup() {
  return state.bank.slice(state.cursor, state.cursor + GROUP_SIZE);
}

function groupDoneCount() {
  return currentGroup().filter((item) => state.mastered.has(item.id)).length;
}

function apiConfigEnabled() {
  return Boolean(state.apiConfig?.enabled && state.apiConfig?.apiKey);
}

function syncApiControls() {
  const config = state.apiConfig || {};
  const defaultModel = config.provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini";
  if (els.useCustomApi) els.useCustomApi.checked = Boolean(config.enabled);
  if (els.apiProvider) els.apiProvider.value = config.provider || "openai";
  if (els.apiKeyInput) els.apiKeyInput.value = config.apiKey || "";
  if (els.apiModelInput) {
    els.apiModelInput.value = config.model || defaultModel;
    els.apiModelInput.placeholder = defaultModel;
  }
  if (els.apiStatusText) {
    els.apiStatusText.textContent = apiConfigEnabled() ? "已启用" : "未启用";
  }
  if (els.apiLine) {
    els.apiLine.textContent = apiConfigEnabled() ? `${config.provider || "OpenAI"} / ${config.model || defaultModel}` : "未连接";
  }
}

function readApiControls() {
  const provider = normalize(els.apiProvider.value, "openai");
  const defaultModel = provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini";
  return {
    enabled: els.useCustomApi.checked,
    provider,
    apiKey: normalize(els.apiKeyInput.value, ""),
    model: normalize(els.apiModelInput.value, defaultModel)
  };
}

async function testApiConnection() {
  const config = readApiControls();
  if (!config.apiKey) {
    toast("璇峰厛濉啓 API Key");
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
    throw new Error(data.error || `API 璇锋眰澶辫触 (${response.status})`);
  }
  if (!Array.isArray(data.items) || !data.items.length) {
    throw new Error("鎺ュ彛杩斿洖涓虹┖");
  }
  state.apiConfig = config;
  save();
  syncApiControls();
}

function toDialogueText(value) {
  if (Array.isArray(value)) {
    return value
      .map((line) => {
        if (!line) return "";
        if (typeof line === "string") return line;
        const role = normalize(line.role, "speaker");
        const text = normalize(line.text, "");
        return `${role}: ${text}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  return normalize(value, "");
}

function normalizeApiItem(item, index, sourceLabel = "AI鐢熸垚") {
  const profile = currentProfile();
  const word = normalize(item.word || item.term || item.english || item.title, "");
  const chinese = normalize(item.chinese || item.meaning || item.translation || item.definition, "");
  const phrase = normalize(item.phrase || item.example || item.exampleSentence || item.sentence, "");
  const phraseCn = normalize(item.phraseCn || item.exampleCn || item.exampleChinese || item.sentenceCn, "");
  const scenario = normalize(item.scenario || item.context || item.scene, "鐪熷疄涓氬姟鍦烘櫙");
  const dialogue = toDialogueText(item.dialogue || item.conversation || item.chat);
  const dialogueCn = toDialogueText(item.dialogueCn || item.conversationCn || item.chatCn);
  const serial = Number(item.serial || state.bank.length + index + 1);

  return {
    id: normalize(item.id, `${sourceLabel.toLowerCase()}-${Date.now()}-${index}`),
    source: normalize(item.source, sourceLabel),
    batch: Number(item.batch) || Math.floor((state.cursor + index) / GROUP_SIZE) + 1,
    word: word || `${profile.product || "product"} term`,
    chinese: chinese || "涓撲笟璇嶄箟寰呭畬鍠?,
    phrase: phrase || `We use ${word || profile.product || "this term"} in ${profile.industry || "our business"} work.`,
    phraseCn: phraseCn || "杩欓噷鏄腑鏂囩ず渚嬪彞锛屾柟渚胯蹇嗐€?,
    scenario,
    dialogue: dialogue || `Customer: Could you explain ${word || profile.product || "this term"}?\nSpecialist: Yes, let me walk you through it.`,
    dialogueCn: dialogueCn || "瀹㈡埛锛氫綘鑳借В閲婁竴涓嬭繖涓瘝鍚楋紵\n涓撳憳锛氬彲浠ワ紝鎴戞潵缁欎綘璇存槑銆?,
    serial
  };
}

function makeLocalItem(index, batchOffset, industry, product) {
  const terms = getBaseTerms(industry, product);
  const roots = terms[index % terms.length];
  const scenario = SCENARIOS[index % SCENARIOS.length];
  const modifier = ["standard", "custom", "real-time", "scalable", "preventive", "certified"][Math.floor(index / 5) % 6];
  const serial = batchOffset + index + 1;
  const term = `${modifier} ${product} ${roots.term}`;
  const phrase = `We need to review the ${term} before the ${scenario.en}.`;
  const phraseCn = `鎴戜滑闇€瑕佸湪${scenario.cn}涔嬪墠纭杩欎釜${roots.cn}鐩稿叧琛ㄨ揪銆俙;
  const dialogue = `Customer: How does your ${product} relate to ${roots.term}?\nSpecialist: We use a ${modifier} workflow to manage ${roots.desc}.`;
  const dialogueCn = `瀹㈡埛锛氫綘浠殑${product}鍜?{roots.cn}鏈変粈涔堝叧绯伙紵\n涓撳憳锛氭垜浠細鐢?{modifier}娴佺▼鏉ュ鐞?{roots.desc}銆俙;
  return {
    id: `local-${serial}`,
    source: "鏈湴鐢熸垚",
    batch: Math.floor(batchOffset / BUFFER_SIZE) + 1,
    word: term,
    chinese: `${product} / ${roots.cn}锛?{industry || "琛屼笟"}鍦烘櫙`,
    phrase,
    phraseCn,
    scenario: scenario.cn,
    dialogue,
    dialogueCn,
    serial
  };
}

async function fetchApiItems(count) {
  if (!apiConfigEnabled()) return [];
  const response = await fetch("/api/generate-learning-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count,
      profile: currentProfile(),
      provider: state.apiConfig.provider,
      apiKey: state.apiConfig.apiKey,
      model: state.apiConfig.model,
      batchOffset: state.bank.length
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API 璇锋眰澶辫触 (${response.status})`);
  }
  return Array.isArray(data.items) ? data.items : [];
}

async function topUpBank(count = BUFFER_SIZE) {
  if (!state.profile) return;
  const industry = normalize(state.profile.industry, "");
  const product = normalize(state.profile.product, "");
  if (!industry || !product) return;

  if (apiConfigEnabled()) {
    const apiItems = await fetchApiItems(count);
    if (apiItems.length) {
      state.generated = state.generated.concat(apiItems.map((item, index) => normalizeApiItem(item, index)));
    }
  } else {
    const batchOffset = state.generated.length;
    const localItems = Array.from({ length: count }, (_, index) => makeLocalItem(index, batchOffset, industry, product));
    state.generated = state.generated.concat(localItems);
  }

  rebuildBank();
  save();
  renderShell();
}

function escapeForText(value) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderShell() {
  syncApiControls();
  const profile = currentProfile();
  els.profileLine.textContent = state.profile ? `${profile.name} 路 ${profile.industry} 路 ${profile.product}` : "杈撳叆琛屼笟涓庝骇鍝佸悗寮€濮嬬敓鎴?;
  els.industryLine.textContent = profile.industry || "鏈缃?;
  els.productLine.textContent = profile.product || "鏈缃?;
  els.bankLine.textContent = `${state.bank.length.toLocaleString()} 鏉;
  els.masteredLine.textContent = String(state.mastered.size);
  els.reviewLine.textContent = String(state.review.size);
  els.planTitle.textContent = state.profile ? `${profile.industry} / ${profile.product} 涓撲笟鑻辫寰幆瀛︿範` : "鍏堣缃綘鐨勮涓氬拰浜у搧";

  const done = groupDoneCount();
  const percent = Math.round((done / GROUP_SIZE) * 100);
  els.groupLine.textContent = `${done} / ${GROUP_SIZE}`;
  els.progressText.textContent = `${percent}%`;
  els.progressCircle.style.strokeDashoffset = `${314 - (314 * percent) / 100}`;
  els.progressHint.textContent = percent >= 100 ? "鏈粍宸插畬鎴愶紝涓嬩竴缁勫唴瀹瑰凡鍑嗗濂姐€? : "瀛﹀畬杩欎竴缁勫悗锛岀郴缁熶細鑷姩鎺ㄩ€佷笅涓€缁勩€?;

  document.querySelectorAll(".accent-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.accent === state.accent);
  });
}

function renderCards(items, compact = false) {
  if (!items.length) {
    els.cards.innerHTML = `<div class="empty-state">鏆傛棤鍐呭銆備綘鍙互瀵煎叆琛ㄦ牸銆佹墜鍔ㄦ坊鍔狅紝鎴栬€呯偣鍑荤敓鎴愭柊鍐呭銆?/div>`;
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const mastered = state.mastered.has(item.id);
      const reviewing = state.review.has(item.id);
      const note = state.notes[item.id] || "";
      return `
        <article class="card ai-card">
          <div class="card-topline">
            <span class="tag">${escapeHtml(item.source)} 路 绗?${item.batch || 1} 鎵?路 ${escapeHtml(item.scenario)}</span>
            <button class="mini-btn" data-expand="${escapeHtml(item.id)}" type="button">${compact ? "鏌ョ湅" : "鍦烘櫙"}</button>
          </div>
          <strong>${escapeHtml(item.word)}</strong>
          <p class="translation">${escapeHtml(item.chinese)}</p>
          <div class="scenario-box ${compact ? "hidden" : ""}" data-detail="${escapeHtml(item.id)}">
            <p><b>鍦烘櫙鍙ワ細</b>${escapeHtml(item.phrase)}</p>
            <p>${escapeHtml(item.phraseCn)}</p>
            <p><b>瀵硅瘽锛?/b>${escapeForText(item.dialogue)}</p>
            <p>${escapeForText(item.dialogueCn)}</p>
          </div>
          <textarea class="note-input" data-note="${escapeHtml(item.id)}" rows="2" placeholder="娣诲姞鑷繁鐨勮蹇嗙瑪璁?>${escapeHtml(note)}</textarea>
          <div class="card-actions">
            <button class="sound-btn" data-speak="${escapeHtml(item.word)}" type="button">璇诲崟璇?/button>
            <button class="sound-btn" data-speak="${escapeHtml(item.phrase)}" type="button">璇诲彞瀛?/button>
            <button class="mastered-btn ${mastered ? "done" : ""}" data-master="${escapeHtml(item.id)}" type="button">${mastered ? "宸叉帉鎻? : "鎺屾彙"}</button>
            <button class="unknown-btn ${reviewing ? "done" : ""}" data-review="${escapeHtml(item.id)}" type="button">${reviewing ? "澶嶄範涓? : "鍔犲叆澶嶄範"}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGameIntro() {
  els.cards.innerHTML = `
    <div class="empty-state">
      鍙充晶灏忔父鎴忎細浠庡綋鍓嶅涔犵粍鎶介锛氳瘝涔夊揩閫夈€佸彞瀛愬～绌哄拰鐪熷疄瀵硅瘽琛ュ叏銆?    </div>
  `;
}

function renderStats() {
  const accuracy = state.gameTotal ? Math.round((state.gameScore / state.gameTotal) * 100) : 0;
  const remaining = Math.max(0, state.bank.length - state.cursor);
  els.cards.innerHTML = `
    <article class="stat-card"><span>璇嶅簱鎬婚噺</span><strong>${state.bank.length.toLocaleString()}</strong></article>
    <article class="stat-card"><span>宸叉帉鎻?/span><strong>${state.mastered.size}</strong></article>
    <article class="stat-card"><span>寰呭涔?/span><strong>${state.review.size}</strong></article>
    <article class="stat-card"><span>灏忔父鎴忔纭巼</span><strong>${accuracy}%</strong></article>
    <div class="empty-state">褰撳墠杩樺墿 ${remaining.toLocaleString()} 鏉″彲瀛﹀唴瀹广€傚瀹屽悗绯荤粺浼氱户缁ˉ鍏呬笅涓€鎵广€?/div>
  `;
}

function render() {
  renderShell();
  const [title, subtitle] = {
    learn: ["浠婃棩瀛︿範缁?, "姣忕粍 10 鏉★紝鍖呭惈鍗曡瘝銆佸満鏅彞鍜屽璇濄€?],
    review: ["澶嶄範鍐呭", "绛旈敊鎴栧姞鍏ュ涔犵殑鍐呭浼氬湪杩欓噷閲嶅鍑虹幇銆?],
    games: ["浜掑姩缁冧範", "鐢ㄥ綋鍓嶅涔犵粍鍋氬揩閫夈€佸～绌哄拰瀵硅瘽琛ュ叏銆?],
    bank: ["璇嶅簱鎬昏", "鏌ョ湅 AI 鐢熸垚鍜屼綘瀵煎叆鐨勫叏閮ㄥ唴瀹广€?],
    stats: ["鏁版嵁鐪嬫澘", "鏌ョ湅鎺屾彙閲忋€佸涔犻噺鍜屽涔犳纭巼銆?]
  }[state.tab];

  els.sectionTitle.textContent = title;
  els.sectionSubtitle.textContent = subtitle;

  if (!state.profile || !state.bank.length) {
    els.cards.innerHTML = `<div class="empty-state">鍏堝～鍐欒涓氬拰浜у搧锛岀劧鍚庣偣鍑烩€滅敓鎴愭垜鐨?AI 涓撲笟璇嶅簱鈥濄€?/div>`;
    return;
  }

  if (state.tab === "learn") return renderCards(filtered(currentGroup()));
  if (state.tab === "review") return renderCards(filtered(state.bank.filter((item) => state.review.has(item.id))));
  if (state.tab === "bank") return renderCards(filtered(state.bank).slice(0, 80), true);
  if (state.tab === "games") return renderGameIntro();
  renderStats();
}

function filtered(items) {
  const q = state.search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    return `${item.word} ${item.chinese} ${item.phrase} ${item.phraseCn} ${item.scenario} ${item.dialogue} ${item.dialogueCn}`
      .toLowerCase()
      .includes(q);
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    toast("褰撳墠娴忚鍣ㄤ笉鏀寔璇煶鎾斁");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.accent;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
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
  const find = (...names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
  const wordIdx = find("word", "english", "term", "鍗曡瘝", "鑻辨枃");
  const cnIdx = find("chinese", "meaning", "涓枃", "閲婁箟");
  const phraseIdx = find("phrase", "sentence", "鍙ュ瓙", "渚嬪彞");
  const scenarioIdx = find("scenario", "鍦烘櫙");
  const dialogueIdx = find("dialogue", "瀵硅瘽");

  return rows.slice(1).map((row, index) => {
    const word = row[wordIdx] || row[0];
    if (!word) return null;
    return {
      id: `import-${Date.now()}-${index}`,
      source: "琛ㄦ牸瀵煎叆",
      batch: "鑷畾涔?,
      word,
      chinese: row[cnIdx] || "鑷畾涔夐噴涔?,
      phrase: row[phraseIdx] || `We need to discuss ${word}.`,
      phraseCn: "杩欐槸瀵煎叆鍐呭鑷姩琛ュ厖鐨勪腑鏂囧彞瀛愩€?,
      scenario: row[scenarioIdx] || "鑷畾涔夊満鏅?,
      dialogue: row[dialogueIdx] || `A: Could you explain ${word}?\nB: Sure, it is important in our workflow.`,
      dialogueCn: "杩欐槸瀵煎叆鍐呭鑷姩琛ュ厖鐨勫璇濄€?,
      serial: state.bank.length + index + 1
    };
  }).filter(Boolean);
}

function setGamePrompt() {
  if (state.gameMode === "match") {
    els.gamePrompt.textContent = "浠庡綋鍓嶅涔犵粍閲屽揩閫熸壘鍑哄搴旇嫳鏂囥€?;
  } else if (state.gameMode === "fill") {
    els.gamePrompt.textContent = "鏍规嵁涓婁笅鏂囪ˉ鍏ㄧ己澶卞崟璇嶃€?;
  } else {
    els.gamePrompt.textContent = "琛ュ叏鐪熷疄涓氬姟瀵硅瘽涓殑涓嬩竴鍙ャ€?;
  }
}

function startGame() {
  const group = currentGroup();
  if (!group.length) {
    toast("鍏堢敓鎴愪竴缁勫唴瀹瑰啀寮€濮嬪皬娓告垙銆?);
    return;
  }
  const item = group[Math.floor(Math.random() * group.length)];
  state.gameAnswer = item;
  state.gameTotal += 1;

  if (state.gameMode === "match") {
    const options = [item];
    while (options.length < Math.min(4, group.length)) {
      const candidate = group[Math.floor(Math.random() * group.length)];
      if (!options.some((option) => option.id === candidate.id)) options.push(candidate);
    }
    els.gamePrompt.innerHTML = `<strong>${escapeHtml(item.chinese)}</strong><br>璇烽€夋嫨瀵瑰簲鑻辨枃銆俙;
    els.gameOptions.innerHTML = options
      .sort(() => Math.random() - 0.5)
      .map((option) => `<button class="option-btn" data-answer="${escapeHtml(option.id)}" type="button">${escapeHtml(option.word)}</button>`)
      .join("");
    return;
  }

  if (state.gameMode === "fill") {
    const words = item.phrase.split(" ");
    const hiddenIndex = Math.max(0, Math.min(words.length - 1, Math.floor(words.length / 2)));
    state.gameAnswer.blank = words[hiddenIndex].replace(/[,.?!]/g, "");
    words[hiddenIndex] = "_____";
    els.gamePrompt.innerHTML = `${escapeHtml(words.join(" "))}<br><small>${escapeHtml(item.phraseCn)}</small>`;
    els.gameOptions.innerHTML = `
      <input id="blankInput" placeholder="璇疯緭鍏ョ己澶卞崟璇? />
      <button class="option-btn" data-blank="1" type="button">鎻愪氦</button>
    `;
    return;
  }

  const dialogue = item.dialogue.split("\n");
  els.gamePrompt.innerHTML = `${escapeHtml(dialogue[0])}<br><strong>琛ュ叏涓嬩竴鍙ワ細</strong>`;
  els.gameOptions.innerHTML = `
    <textarea id="dialogueInput" rows="3" placeholder="杈撳叆浣犱細鎬庝箞鍥炲簲"></textarea>
    <button class="option-btn" data-dialogue="1" type="button">鎻愪氦瀵硅瘽</button>
  `;
}

function finishGame(correct) {
  if (correct) {
    state.gameScore += 1;
    state.mastered.add(state.gameAnswer.id);
    toast("鍥炵瓟姝ｇ‘锛屽凡璁″叆鎺屾彙銆?);
  } else {
    state.review.add(state.gameAnswer.id);
    toast("宸插姞鍏ュ涔犲簱銆?);
  }
  save();
  renderShell();
}

async function advanceGroup(force = false) {
  const group = currentGroup();
  if (!force && group.some((item) => !state.mastered.has(item.id))) {
    toast("杩欎竴缁勮繕鏈夊唴瀹规病鎺屾彙锛屼篃鍙互缁х画鎺ㄨ繘銆?);
  }
  state.cursor += GROUP_SIZE;
  if (state.cursor + GROUP_SIZE > state.bank.length) {
    await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  }
  save();
  render();
}

function markApiStateFromForm() {
  state.apiConfig = readApiControls();
  save();
  syncApiControls();
}

document.querySelector("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = normalize(document.querySelector("#nameInput").value, "瀛︿範鑰?);
  const industry = normalize(document.querySelector("#industryInput").value, "");
  const product = normalize(document.querySelector("#productInput").value, "");
  if (!industry || !product) {
    toast("璇峰厛濉啓琛屼笟鍜屼骇鍝併€?);
    return;
  }

  state.profile = { name, industry, product };
  state.imported = [];
  state.generated = [];
  state.mastered.clear();
  state.review.clear();
  state.notes = {};
  state.cursor = 0;
  markApiStateFromForm();
  save();
  document.querySelector("#setupModal").classList.add("hidden");
  await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  render();
});

document.querySelector("#openSetupBtn").addEventListener("click", () => {
  syncApiControls();
  document.querySelector("#setupModal").classList.remove("hidden");
});

document.querySelector("#closeSetupBtn").addEventListener("click", () => {
  if (state.profile) {
    document.querySelector("#setupModal").classList.add("hidden");
  } else {
    toast("璇峰厛濉啓琛屼笟鍜屼骇鍝併€?);
  }
});

els.testApiBtn.addEventListener("click", async () => {
  try {
    await testApiConnection();
    toast("API 杩炴帴鎴愬姛");
  } catch (error) {
    toast(error.message || "API 杩炴帴澶辫触");
  }
});

document.querySelector("#generateBtn").addEventListener("click", async () => {
  if (!state.profile) {
    document.querySelector("#setupModal").classList.remove("hidden");
    return;
  }
  await topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
  toast(apiConfigEnabled() ? "宸查€氳繃浣犵殑 API 缁啓涓€鎵瑰唴瀹广€? : "宸茬敓鎴愭柊鐨勫涔犲唴瀹广€?);
  render();
});

document.querySelector("#nextGroupBtn").addEventListener("click", async () => {
  await advanceGroup(true);
});

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.tab = button.dataset.tab;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
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

els.cards.addEventListener("click", async (event) => {
  const speakBtn = event.target.closest("[data-speak]");
  if (speakBtn) {
    speak(speakBtn.dataset.speak);
    return;
  }

  const masterBtn = event.target.closest("[data-master]");
  if (masterBtn) {
    state.mastered.add(masterBtn.dataset.master);
    state.review.delete(masterBtn.dataset.master);
    save();
    render();
    if (groupDoneCount() >= GROUP_SIZE) {
      await advanceGroup(true);
    }
    return;
  }

  const reviewBtn = event.target.closest("[data-review]");
  if (reviewBtn) {
    state.review.add(reviewBtn.dataset.review);
    save();
    render();
    return;
  }

  const expandBtn = event.target.closest("[data-expand]");
  if (expandBtn) {
    const detail = document.querySelector(`[data-detail="${expandBtn.dataset.expand}"]`);
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
  if (!word || !chinese) {
    toast("璇疯嚦灏戝～鍐欏崟璇嶅拰涓枃閲婁箟銆?);
    return;
  }

  state.imported.unshift({
    id: `custom-${Date.now()}`,
    source: "鎵嬪姩娣诲姞",
    batch: "鑷畾涔?,
    word,
    chinese,
    phrase,
    phraseCn: "杩欐槸浣犳墜鍔ㄦ坊鍔犵殑閲嶇偣琛ㄨ揪銆?,
    scenario: "涓汉閲嶇偣",
    dialogue: `A: Could you explain ${word}?\nB: Sure. ${phrase}`,
    dialogueCn: `A锛氫綘鑳借В閲婁竴涓?{word}鍚楋紵\nB锛氬彲浠ャ€?{chinese}`,
    serial: state.bank.length + 1
  });

  rebuildBank();
  event.target.reset();
  save();
  toast("宸插姞鍏ユ寔缁粌涔犲簱銆?);
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
  toast(`宸插鍏?${imported.length} 鏉″涔犵礌鏉愩€俙);
  render();
});

document.querySelector(".game-mode").addEventListener("click", (event) => {
  const button = event.target.closest("[data-game]");
  if (!button) return;
  state.gameMode = button.dataset.game;
  document.querySelectorAll(".mode-btn").forEach((item) => item.classList.toggle("active", item === button));
  els.gameOptions.innerHTML = "";
  setGamePrompt();
});

document.querySelector("#startGameBtn").addEventListener("click", startGame);

els.gameOptions.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  if (answer) {
    finishGame(answer.dataset.answer === state.gameAnswer.id);
    return;
  }

  if (event.target.closest("[data-blank]")) {
    const value = normalize(document.querySelector("#blankInput").value, "").toLowerCase();
    finishGame(value === normalize(state.gameAnswer.blank, "").toLowerCase());
    return;
  }

  if (event.target.closest("[data-dialogue]")) {
    const value = normalize(document.querySelector("#dialogueInput").value, "");
    finishGame(value.length >= 12);
  }
});

document.querySelector(".accent-toggle")?.addEventListener("keydown", () => {});

rebuildBank();
syncApiControls();
render();

if (state.profile && !state.bank.length) {
  void topUpBank(apiConfigEnabled() ? GROUP_SIZE * 3 : BUFFER_SIZE);
}

if (!state.profile) {
  document.querySelector("#setupModal").classList.remove("hidden");
}
