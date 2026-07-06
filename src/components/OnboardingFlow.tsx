import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, KeyRound, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { ApiConfig, AppLanguage, AssessmentResult, UserProfile } from "../types";
import { assessmentQuestions } from "../assessmentQuestions";

interface Props {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  initialProfile: UserProfile;
  initialApiConfig: ApiConfig | null;
  existingAssessment: AssessmentResult | null;
  initialStep?: number;
  onComplete: (profile: UserProfile, api: ApiConfig, result: AssessmentResult) => void;
}

type Question = { type: "english" | "trade"; difficulty: number; zh: string; en: string; options: string[]; answer: number };

const englishSeed = [
  ["请选择最接近 quotation 的含义", "Choose the meaning of quotation", "报价单|装箱单|提单|原产地证", 0],
  ["哪一句能礼貌确认交期？", "Which sentence politely confirms lead time?", "Deliver now.|Could you confirm the expected lead time?|You are late.|Finish it.", 1],
  ["选择正确句子", "Choose the correct sentence", "If quantity increases, we can revise the price.|If quantity increase, we revised price.|If quantity increasing, revise.|Quantity increase price.", 0],
  ["root cause analysis 是什么？", "What is root cause analysis?", "运费计算|问题根因分析|付款确认|包装检查", 1],
  ["哪个结尾最专业？", "Which closing is most professional?", "Reply ASAP.|Let me know.|Please let me know if you need further information.|That's all.", 2],
];
const tradeSeed = [
  ["FOB 条件下，通常由谁安排主要海运？", "Under FOB, who normally arranges main carriage?", "卖方|买方|银行|海关", 1],
  ["客户要求 Net 60，主要影响什么？", "What does Net 60 mainly affect?", "包装|现金流与信用风险|产品颜色|HS编码", 1],
  ["信用证出现不符点时，首要动作是什么？", "What is the first action for an L/C discrepancy?", "直接发货|核对条款并联系开证申请人修改|降价|更换货代", 1],
  ["处理质量索赔时最专业的顺序是？", "Best sequence for a quality claim?", "否认-争论-结束|确认事实-收集证据-根因分析-纠正方案|退款即可|转给货代", 1],
  ["谈判中 BATNA 指什么？", "What does BATNA mean in negotiation?", "最低报价|最佳替代方案|银行费用|年度预算", 1],
];

const questions: Question[] = Array.from({ length: 50 }, (_, index) => {
  const type = index < 25 ? "english" : "trade";
  const local = index % 25;
  const seed = (type === "english" ? englishSeed : tradeSeed)[local % 5];
  const difficulty = Math.floor(local / 5) + 1;
  return {
    type,
    difficulty,
    zh: `${seed[0]}（难度 ${difficulty}）`,
    en: `${seed[1]} (difficulty ${difficulty})`,
    options: String(seed[2]).split("|"),
    answer: Number(seed[3]),
  };
});

const defaultApi: ApiConfig = { provider: "deepseek", model: "deepseek-chat", apiKey: "" };

export default function OnboardingFlow({ language, setLanguage, initialProfile, initialApiConfig, existingAssessment, initialStep = 0, onComplete }: Props) {
  const zh = language === "zh";
  const [step, setStep] = useState(initialStep);
  const [profile, setProfile] = useState(initialProfile);
  const [api, setApi] = useState(initialApiConfig || defaultApi);
  const [apiStatus, setApiStatus] = useState<"idle" | "testing" | "success" | "error">(initialApiConfig ? "success" : "idle");
  const [apiMessage, setApiMessage] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>(() => { try { return JSON.parse(sessionStorage.getItem("proenglish.assessment.answers") || "{}"); } catch { return {}; } });
  const [page, setPage] = useState(() => Math.min(4, Math.floor(Object.keys(answers).length / 10)));
  const [result, setResult] = useState<AssessmentResult | null>(existingAssessment);
  const [dailyWords, setDailyWords] = useState(existingAssessment?.dailyWords || 20);
  const [dailySentences, setDailySentences] = useState(existingAssessment?.dailySentences || 8);
  const pageQuestions = assessmentQuestions.slice(page * 10, page * 10 + 10);
  const canProfile = profile.name.trim() && profile.role.trim() && profile.industry.trim() && profile.product.trim() && profile.market.trim();

  useEffect(() => { sessionStorage.setItem("proenglish.assessment.answers", JSON.stringify(answers)); }, [answers]);

  const scores = useMemo(() => {
    const calc = (type: "english" | "trade") => assessmentQuestions.reduce((sum, q, i) => sum + (q.track === type && answers[i] === q.answer ? q.level : 0), 0);
    const english = calc("english");
    const trade = calc("trade");
    const level = (track: "english" | "trade", points: number) => {
      const trackQuestions = assessmentQuestions.filter((q) => q.track === track);
      const highestBand = Math.max(1, ...trackQuestions.filter((q, i) => answers[assessmentQuestions.indexOf(q)] === q.answer).map((q) => q.level));
      const accuracy = points / trackQuestions.reduce((sum, q) => sum + q.level, 0);
      return Math.max(1, Math.min(10, Math.round(accuracy * 8 + highestBand * 0.2)));
    };
    return { english, trade, englishLevel: level("english", english), tradeLevel: level("trade", trade) };
  }, [answers]);

  const testApi = async () => {
    if (!api.apiKey.trim()) { setApiStatus("error"); setApiMessage(zh ? "请先填写有效的 API Key。" : "Enter a valid API key first."); return; }
    setApiStatus("testing"); setApiMessage(zh ? "正在验证连接…" : "Testing connection...");
    try {
      const response = await fetch("/api/generate-learning-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionTest: true, count: 1, profile, ...api }) });
      const data = await response.json();
      if (!response.ok || !data.items?.length) throw new Error(data.error || "Connection failed");
      setApiStatus("success"); setApiMessage(zh ? "连接成功，可以开始能力测评。" : "Connected. You can start the assessment.");
    } catch (error) { setApiStatus("error"); setApiMessage(error instanceof Error ? error.message : "Connection failed"); }
  };

  const finishTest = () => {
    const domains = ["vocabulary", "grammar", "communication", "process", "risk", "negotiation"] as const;
    const domainScores = Object.fromEntries(domains.map((domain) => {
      const items = assessmentQuestions.map((q, i) => ({ q, i })).filter(({ q }) => q.domain === domain);
      const correct = items.filter(({ q, i }) => answers[i] === q.answer).length;
      return [domain, Math.round((correct / items.length) * 100)];
    }));
    const ranked = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
    const next: AssessmentResult = {
      score: Math.round(((scores.english + scores.trade) / 150) * 100), level: `E${scores.englishLevel} · T${scores.tradeLevel}`,
      englishLevel: scores.englishLevel, tradeLevel: scores.tradeLevel, vocabularyEstimate: 800 + scores.englishLevel * 700,
      dailyWords, dailySentences, domainScores,
      strengths: ranked.slice(0, 2).map(([name]) => name), focusAreas: ranked.slice(-2).reverse().map(([name]) => name),
      completedAt: new Date().toISOString(),
    };
    setResult(next); setStep(3);
    sessionStorage.removeItem("proenglish.assessment.answers");
  };

  const labels = zh ? ["用户与行业档案", "连接 AI 服务", "双能力测评", "每日成长计划"] : ["Profile & industry", "Connect AI", "Dual assessment", "Daily growth plan"];
  return <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4 md:p-8">
    <div className="w-full max-w-6xl min-h-[680px] bg-white border border-slate-100 rounded-[28px] shadow-[0_24px_70px_rgba(30,41,59,.10)] overflow-hidden grid md:grid-cols-[300px_1fr]">
      <aside className="bg-[#6366F1] text-white p-8 flex flex-col"><div className="text-xl font-black">PRO.EN</div><div className="mt-12"><p className="text-xs font-black text-white/60">{zh ? "首次能力建档" : "INITIAL PROFILING"}</p><h1 className="text-3xl font-black mt-3">{zh ? "英语与外贸能力双成长" : "Grow English and global trade skills"}</h1><p className="text-sm text-white/70 mt-4">{zh ? "50 道分级题精准定位起点，跳过已掌握内容。" : "50 graded questions find your exact starting point and skip mastered content."}</p></div>
        <ol className="mt-10 space-y-4">{labels.map((label, i) => { const Icon = [UserRound, KeyRound, Sparkles, ShieldCheck][i]; return <li key={label} className={`flex items-center gap-3 text-sm font-bold ${i <= step ? "text-white" : "text-white/40"}`}><span className={`w-9 h-9 rounded-xl flex items-center justify-center ${i < step ? "bg-[#2DD4BF]" : "bg-white/10"}`}>{i < step ? <Check className="w-4" /> : <Icon className="w-4" />}</span>{label}</li>; })}</ol>
      </aside>
      <main className="p-6 md:p-10 overflow-y-auto max-h-[92vh]"><div className="flex justify-end mb-5 gap-1"><button onClick={() => setLanguage("zh")} className={`px-3 py-2 rounded-lg text-xs font-black ${zh ? "bg-[#6366F1] text-white" : "text-slate-400"}`}>中文</button><button onClick={() => setLanguage("en")} className={`px-3 py-2 rounded-lg text-xs font-black ${!zh ? "bg-[#6366F1] text-white" : "text-slate-400"}`}>English</button></div>
        {step === 0 && <section><p className="text-xs font-black text-[#6366F1]">01 · PROFILE</p><h2 className="text-3xl font-black text-[#1E293B] mt-2">{zh ? "先认识你的工作场景" : "Tell us about your work"}</h2><div className="grid sm:grid-cols-2 gap-4 mt-8">{([['name','称呼','Name'],['role','职业身份','Role'],['industry','所在行业','Industry'],['product','产品 / 服务','Product / Service'],['market','目标市场','Target Market'],['learningGoal','学习目标','Learning Goal']] as const).map(([field,z,e]) => <label key={field} className={field === 'learningGoal' ? 'sm:col-span-2' : ''}><span className="block text-xs font-black text-slate-600 mb-2">{zh ? z : e}</span><input value={profile[field]} onChange={ev => setProfile(p => ({...p,[field]:ev.target.value}))} className="w-full h-12 rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 text-sm font-bold" /></label>)}</div><div className="flex justify-end mt-8"><button disabled={!canProfile} onClick={() => setStep(1)} className="h-12 px-6 rounded-xl bg-[#6366F1] text-white font-black disabled:opacity-40 flex items-center gap-2">{zh ? "继续绑定 AI" : "Continue"}<ArrowRight className="w-4" /></button></div></section>}
        {step === 1 && <section><p className="text-xs font-black text-[#6366F1]">02 · API</p><h2 className="text-3xl font-black text-[#1E293B] mt-2">{zh ? "连接你的 AI 服务" : "Connect your AI provider"}</h2><p className="text-sm text-slate-400 mt-3">{zh ? "密钥只保留在当前浏览器会话。" : "Your key stays in this browser session only."}</p><div className="grid sm:grid-cols-2 gap-4 mt-8"><label><span className="text-xs font-black">Provider</span><select value={api.provider} onChange={e => { const provider=e.target.value as ApiConfig['provider']; setApi(a=>({...a,provider,model:provider==='deepseek'?'deepseek-chat':'gpt-4.1-mini'})); setApiStatus('idle'); }} className="w-full h-12 mt-2 rounded-xl border px-4"><option value="deepseek">DeepSeek</option><option value="openai">OpenAI</option></select></label><label><span className="text-xs font-black">Model</span><input value={api.model} onChange={e=>setApi(a=>({...a,model:e.target.value}))} className="w-full h-12 mt-2 rounded-xl border px-4" /></label><label className="sm:col-span-2"><span className="text-xs font-black">API Key</span><input type="password" value={api.apiKey} onChange={e=>{setApi(a=>({...a,apiKey:e.target.value}));setApiStatus('idle')}} className="w-full h-12 mt-2 rounded-xl border px-4" /></label></div><p className={`mt-5 p-4 rounded-xl text-xs font-bold ${apiStatus==='error'?'bg-rose-50 text-rose-600':apiStatus==='success'?'bg-emerald-50 text-emerald-600':'bg-slate-50 text-slate-500'}`}>{apiMessage || (zh?'测试连接仅发送一次最小请求。':'Connection test sends one minimal request.')}</p><div className="flex justify-between mt-8"><button onClick={()=>setStep(0)} className="h-12 px-5 border rounded-xl font-black flex gap-2 items-center"><ArrowLeft className="w-4"/>{zh?'返回':'Back'}</button><div className="flex gap-3"><button onClick={testApi} className="h-12 px-5 border border-indigo-200 text-indigo-600 rounded-xl font-black">{apiStatus==='testing'?(zh?'连接中…':'Testing...'):(zh?'测试连接':'Test')}</button><button disabled={apiStatus!=='success'} onClick={()=>setStep(existingAssessment?3:2)} className="h-12 px-6 bg-[#6366F1] text-white rounded-xl font-black disabled:opacity-40">{zh?'开始 50 题测评':'Start 50 questions'}</button></div></div></section>}
        {step === 2 && <section><div className="flex justify-between items-end"><div><p className="text-xs font-black text-[#6366F1]">03 · DUAL ASSESSMENT</p><h2 className="text-3xl font-black text-[#1E293B] mt-2">{zh?'英语 + 外贸能力测评':'English + Trade Assessment'}</h2><p className="text-sm font-semibold text-slate-400 mt-2">{page < 3 ? (zh ? '先测试英语词汇、语法和商务表达' : 'English vocabulary, grammar and communication') : (zh ? '再测试外贸流程、风控与谈判能力' : 'Trade process, risk and negotiation')}</p></div><div className="text-right"><b className="text-2xl text-[#6366F1]">{Object.keys(answers).length}/50</b><p className="text-xs text-slate-400">{zh?'已完成':'answered'}</p></div></div><div className="mt-5 h-2 bg-slate-100 rounded-full"><div className="h-full bg-[#2DD4BF] rounded-full transition-all" style={{width:`${Object.keys(answers).length*2}%`}}/></div><div className="space-y-4 mt-7">{pageQuestions.map((q,offset)=>{const i=page*10+offset;const options=zh?q.optionsZh:q.optionsEn;return <fieldset key={q.id} className="border rounded-2xl p-4"><legend className="px-2 text-sm font-black"><span className={`mr-2 text-[10px] px-2 py-1 rounded ${q.track==='english'?'bg-indigo-50 text-indigo-600':'bg-emerald-50 text-emerald-600'}`}>{q.track==='english'?(zh?'英语':'ENGLISH'):(zh?'外贸':'TRADE')} · L{q.level}</span>{i+1}. {zh?q.zh:q.en}</legend><div className="grid sm:grid-cols-2 gap-2 mt-3">{options.map((o,oi)=><button type="button" key={`${q.id}-${oi}`} onClick={()=>setAnswers(a=>({...a,[i]:oi}))} className={`text-left px-3 py-2.5 rounded-xl border text-sm font-bold ${answers[i]===oi?'bg-[#6366F1] text-white border-[#6366F1]':'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}>{String.fromCharCode(65+oi)}. {o}</button>)}</div></fieldset>})}</div><div className="sticky bottom-0 bg-white/95 backdrop-blur py-4 flex justify-between mt-3 border-t"><button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="px-5 h-11 border rounded-xl font-black disabled:opacity-30">{zh?'上一组':'Previous'}</button><span className="self-center text-xs font-black text-slate-400">{page+1} / 5</span>{page<4?<button disabled={pageQuestions.some((_,o)=>answers[page*10+o]===undefined)} onClick={()=>setPage(p=>p+1)} className="px-6 h-11 bg-[#6366F1] text-white rounded-xl font-black disabled:opacity-30">{zh?'下一组':'Next 10'}</button>:<button disabled={Object.keys(answers).length!==50} onClick={finishTest} className="px-6 h-11 bg-[#6366F1] text-white rounded-xl font-black disabled:opacity-30">{zh?'查看双能力报告':'View report'}</button>}</div></section>}
        {step === 3 && result && <section><p className="text-xs font-black text-[#6366F1]">04 · YOUR PLAN</p><h2 className="text-3xl font-black mt-2 text-[#1E293B]">{zh?'你的双能力起点':'Your dual-skill starting point'}</h2><div className="grid sm:grid-cols-2 gap-4 mt-7"><div className="p-6 rounded-2xl bg-indigo-50"><p className="text-xs font-black text-indigo-500">{zh?'英语等级':'ENGLISH LEVEL'}</p><b className="text-4xl text-indigo-700">L{result.englishLevel}</b><p className="text-sm mt-2 text-indigo-500">{zh?`预估词汇量 ${result.vocabularyEstimate.toLocaleString()}`:`Estimated vocabulary ${result.vocabularyEstimate.toLocaleString()}`}</p></div><div className="p-6 rounded-2xl bg-emerald-50"><p className="text-xs font-black text-emerald-500">{zh?'外贸实战等级':'TRADE LEVEL'}</p><b className="text-4xl text-emerald-700">L{result.tradeLevel}</b><p className="text-sm mt-2 text-emerald-600">{zh?'课程将覆盖术语、谈判、风控与复杂业务处理':'Terms, negotiation, risk and complex cases'}</p></div></div><h3 className="text-lg font-black mt-8">{zh?'设置每日小目标':'Set daily goals'}</h3><div className="grid sm:grid-cols-2 gap-4 mt-4"><label className="p-5 border rounded-2xl"><span className="text-sm font-black">{zh?'每天学习词汇':'Words per day'}</span><input type="range" min="5" max="60" step="5" value={dailyWords} onChange={e=>setDailyWords(Number(e.target.value))} className="w-full mt-4 accent-indigo-500"/><b className="text-2xl text-indigo-600">{dailyWords}</b></label><label className="p-5 border rounded-2xl"><span className="text-sm font-black">{zh?'每天学习外贸语句':'Trade sentences per day'}</span><input type="range" min="3" max="30" step="1" value={dailySentences} onChange={e=>setDailySentences(Number(e.target.value))} className="w-full mt-4 accent-emerald-500"/><b className="text-2xl text-emerald-600">{dailySentences}</b></label></div><button onClick={()=>onComplete(profile,api,{...result,dailyWords,dailySentences})} className="w-full h-14 mt-8 rounded-xl bg-[#6366F1] text-white font-black flex justify-center items-center gap-2">{zh?'生成我的学习与外贸成长路径':'Create my growth path'}<ArrowRight className="w-4"/></button></section>}
      </main>
    </div>
  </div>;
}
