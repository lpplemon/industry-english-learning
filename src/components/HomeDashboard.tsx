import { useState } from "react";
import { StudyStats, LessonCard, Achievement, UserProfile, AppLanguage, AssessmentResult, ApiConfig } from "../types";
import { Flag, Flame, Sparkles, Award, Star, Timer, CheckCircle, SpellCheck, Play, ArrowRight, TrendingUp, MessageCircle, X, Send } from "lucide-react";

interface HomeDashboardProps {
  stats: StudyStats;
  addMinutes: (mins: number) => void;
  recommendedLesson: LessonCard;
  lessons: LessonCard[];
  achievements: Achievement[];
  startDailyPractice: () => void;
  startLesson: (lessonId: string) => void;
  onReviewCopilot: () => void;
  profile: UserProfile;
  language: AppLanguage;
  assessment: AssessmentResult;
  assistantVisible: boolean;
  apiConfig: ApiConfig;
}

export default function HomeDashboard({
  stats,
  addMinutes,
  recommendedLesson,
  lessons,
  achievements,
  startDailyPractice,
  startLesson,
  onReviewCopilot,
  profile,
  language,
  assessment,
  assistantVisible,
  apiConfig,
}: HomeDashboardProps) {
  const zh = language === "zh";
  const goalPercent = Math.min(100, Math.round((stats.todayMinutes / stats.dailyGoalMinutes) * 100));
  const remainingMins = Math.max(0, stats.dailyGoalMinutes - stats.todayMinutes);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<string[]>([zh ? `今天先完成 ${assessment.dailyWords} 个词汇和 ${assessment.dailySentences} 个外贸语句。你也可以把客户的问题发给我。` : `Start with ${assessment.dailyWords} words and ${assessment.dailySentences} trade sentences. You can also send me a customer question.`]);

  const askAssistant = async () => {
    const text = assistantInput.trim();
    if (!text || assistantLoading) return;
    setAssistantMessages((items) => [...items, `YOU: ${text}`]); setAssistantInput(""); setAssistantLoading(true);
    try {
      const response = await fetch("/api/coach-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coachId: "assistant", provider: apiConfig.provider, model: apiConfig.model, apiKey: apiConfig.apiKey, customPrompt: `You are a concise bilingual export-trade assistant. User industry: ${profile.industry}; product: ${profile.product}; market: ${profile.market}. Help draft responses, explain trade issues and encourage progress.`, messages: [{ role: "user", content: text }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Assistant unavailable");
      setAssistantMessages((items) => [...items, data.text]);
    } catch { setAssistantMessages((items) => [...items, zh ? "暂时无法连接 AI。你可以继续学习，或检查设置中的 API。" : "AI is temporarily unavailable. Continue learning or check your API settings."]); }
    finally { setAssistantLoading(false); }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] font-sans leading-none">
            {zh ? `早上好，${profile.name}。` : `Good morning, ${profile.name}.`}
          </h1>
          <p className="text-base font-semibold text-slate-400 mt-2">
            {zh ? "这是你今天的专业英语学习简报。" : "Here is your professional learning briefing for today."}
          </p>
        </div>
        <button
          onClick={startDailyPractice}
          className="bg-[#6366F1] hover:bg-[#5254de] text-white text-base font-black px-7 py-4 rounded-2xl flex items-center gap-3 transition-all duration-200 shadow-[0_10px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.4)] active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          {zh ? "开始今日练习" : "Start Daily Practice"}
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 min-w-fit"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><TrendingUp className="w-5"/></div><div><p className="text-[10px] font-black text-slate-400">{zh ? "双能力诊断" : "DUAL-SKILL DIAGNOSIS"}</p><p className="text-sm font-black text-slate-800">English L{assessment.englishLevel} · Trade L{assessment.tradeLevel}</p></div></div>
        <div className="h-px md:h-8 md:w-px bg-slate-100" />
        <div className="flex-1"><p className="text-[10px] font-black text-slate-400">{zh ? "当前重点" : "CURRENT FOCUS"}</p><div className="flex flex-wrap gap-2 mt-1">{assessment.focusAreas.map(area=><span key={area} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase">{area}</span>)}</div></div>
        <button onClick={startDailyPractice} className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black">{zh ? "按弱项开始练习" : "Practice focus areas"}</button>
      </div>

      {/* Bento Grid: Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Daily Goal (Span 4) */}
        <div className="md:col-span-4 bg-white rounded-[32px] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-sm font-extrabold text-[#1E293B] uppercase tracking-wider">{zh ? "今日目标" : "Daily Goal"}</h2>
            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center">
              <Flag className="w-5 h-5 text-[#6366F1]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-4xl font-black text-[#1E293B]">{assessment.dailyWords}</span><p className="text-xs font-bold text-slate-400 mt-1">{zh ? "行业词汇" : "industry words"}</p></div>
            <div><span className="text-4xl font-black text-[#1E293B]">{assessment.dailySentences}</span><p className="text-xs font-bold text-slate-400 mt-1">{zh ? "外贸语句" : "trade sentences"}</p></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3.5 my-6 overflow-hidden">
            <div
              className="bg-[#2DD4BF] h-full rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-auto">
            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[170px]">
              {zh ? `英语 L${assessment.englishLevel} · 外贸 L${assessment.tradeLevel}` : `English L${assessment.englishLevel} · Trade L${assessment.tradeLevel}`}
            </p>
            <button
              onClick={() => addMinutes(6)}
              className="text-xs bg-[#F7F9FC] border border-slate-200 text-[#6366F1] font-black px-3.5 py-2 rounded-xl hover:bg-[#6366F1]/10 transition-colors cursor-pointer"
            >
              +6 {zh ? "分钟" : "Min"}
            </button>
          </div>
        </div>

        {/* Study Streak (Span 3) */}
        <div className="md:col-span-3 bg-white rounded-[32px] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FB7185]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h2 className="text-sm font-extrabold text-[#1E293B] uppercase tracking-wider">{zh ? "连续学习" : "Streak"}</h2>
            <div className="w-10 h-10 rounded-full bg-[#FFE4E6] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#FB7185]" />
            </div>
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-5xl font-black text-[#1E293B] leading-none tracking-tight mb-1">
              {stats.streak}
            </span>
            <span className="text-sm font-bold text-slate-400">{zh ? "连续天数" : "Days consecutive"}</span>
          </div>
          <div className="flex justify-between mt-6 relative z-10 gap-1">
            {/* Days mini indicator */}
            {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
              const isActive = idx <= 3; // Mocking today is Thursday (index 3)
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isActive
                      ? "bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)]"
                      : "bg-[#F7F9FC] text-slate-400 border border-slate-100"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Copilot Suggestion (Span 5) */}
        <div className="md:col-span-5 bg-white rounded-[32px] p-[1.5px] shadow-[0_12px_32px_rgba(99,102,241,0.06)] relative overflow-hidden group border border-[#6366F1]/10 hover:border-[#6366F1]/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/10 to-[#FB7185]/10 opacity-60 z-0"></div>
          <div className="h-full w-full bg-white rounded-[31px] p-8 relative z-10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6366F1]"></span>
                </span>
                <h2 className="text-xs font-extrabold text-[#6366F1] uppercase tracking-widest leading-none">
                  {zh ? "AI 学习建议" : "AI Copilot Suggestion"}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EEF2F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#6366F1]" />
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-[#1E293B] leading-relaxed">
                {zh ? "根据你的行业与学习目标，建议现在复习 " : "Based on your upcoming meeting notes, you should review "}
                <span className="text-[#6366F1] border-b-2 border-[#6366F1]/20 pb-0.5 font-black">
                  {recommendedLesson.tag2}
                </span>{" "}
                {zh ? `，用于${profile.industry}场景。` : `for ${profile.industry.toLowerCase()}.`}
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs font-extrabold bg-[#EEF2F6] text-[#6366F1] px-4 py-1.5 rounded-full">
                {zh ? "5 分钟" : "5 min read"}
              </span>
              <button
                onClick={onReviewCopilot}
                className="text-sm font-black text-[#6366F1] hover:text-[#5254de] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {zh ? "立即复习" : "Review Now"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Lesson Banner */}
      <div
        onClick={() => startLesson(recommendedLesson.id)}
        className="w-full bg-white rounded-[32px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row group cursor-pointer hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)] transition-all duration-300"
      >
        <div className="md:w-2/5 h-56 md:h-auto relative overflow-hidden bg-slate-50">
          <img
            alt={recommendedLesson.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={recommendedLesson.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/25 to-transparent"></div>
          <div className="absolute top-6 left-6">
            <span className="bg-[#6366F1] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
              {zh ? "开始今日练习" : "Start Today's Practice"}
            </span>
          </div>
        </div>
        <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative z-10">
          <div className="flex gap-2.5 mb-4">
            <span className="bg-[#EEF2F6] text-[#6366F1] text-xs font-black px-3.5 py-1.5 rounded-full border border-slate-100">
              {recommendedLesson.category}
            </span>
            <span className="bg-[#FFF1F2] text-[#FB7185] text-xs font-black px-3.5 py-1.5 rounded-full border border-rose-50">
              {zh ? "词汇" : "Vocabulary"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mb-3 group-hover:text-[#6366F1] transition-colors font-sans tracking-tight leading-tight">
            {recommendedLesson.title}
          </h2>
          <p className="text-sm md:text-base font-semibold text-slate-400 mb-8 max-w-xl leading-relaxed">
            {recommendedLesson.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-6 text-slate-400 text-sm font-bold">
              <span className="flex items-center gap-1.5">
                <Timer className="w-4.5 h-4.5 text-slate-300" /> {recommendedLesson.time}
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-slate-300" /> {recommendedLesson.level}
              </span>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-[#EEF2F6] flex items-center justify-center text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white transition-all duration-200 shadow-sm">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {assistantVisible && <><button onClick={() => setAssistantOpen(true)} className="fixed right-6 bottom-6 z-40 w-14 h-14 rounded-2xl bg-[#6366F1] text-white shadow-xl flex items-center justify-center" aria-label={zh ? "打开 AI 助手" : "Open AI assistant"}><MessageCircle className="w-6"/></button>{assistantOpen && <div className="fixed right-5 bottom-5 z-50 w-[min(390px,calc(100vw-40px))] h-[560px] bg-white border border-slate-100 shadow-2xl rounded-2xl flex flex-col overflow-hidden"><header className="p-4 border-b flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Sparkles className="w-5"/></div><div className="flex-1"><p className="font-black text-slate-800">{zh ? "AI 外贸助手" : "AI Trade Assistant"}</p><p className="text-[11px] font-bold text-emerald-500">{zh ? "结合你的行业档案" : "Uses your industry profile"}</p></div><button onClick={() => setAssistantOpen(false)} className="w-9 h-9 rounded-lg border flex items-center justify-center"><X className="w-4"/></button></header><div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FC]">{assistantMessages.map((message,index)=><div key={`${message}-${index}`} className={`p-3 rounded-xl text-sm font-semibold leading-relaxed ${message.startsWith('YOU:')?'ml-10 bg-indigo-600 text-white':'mr-6 bg-white border text-slate-600'}`}>{message.replace(/^YOU: /,'')}</div>)}{assistantLoading&&<p className="text-xs font-bold text-slate-400">{zh?'正在思考…':'Thinking...'}</p>}</div><div className="p-3 border-t flex gap-2"><input value={assistantInput} onChange={event=>setAssistantInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')void askAssistant()}} placeholder={zh?'粘贴客户问题或输入需求…':'Paste a customer question...'} className="flex-1 min-w-0 h-11 px-3 rounded-xl border text-sm font-semibold"/><button onClick={()=>void askAssistant()} className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Send className="w-4"/></button></div></div>}</>}

      {/* Lower Grid: Achievements & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-[#1E293B]">{zh ? "最近成就" : "Recent Achievements"}</h3>
            <span className="text-xs font-black text-[#6366F1] hover:underline cursor-pointer">
              {zh ? "查看全部" : "View All"}
            </span>
          </div>
          <div className="space-y-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F7F9FC] transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] text-[#854D0E] flex items-center justify-center shadow-sm">
                  {ach.icon === "military_tech" ? (
                    <Award className="w-6 h-6 text-amber-600" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-[#1E293B] group-hover:text-[#6366F1] transition-colors">
                    {ach.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {ach.subtitle}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">{ach.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Statistics Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-[#1E293B]">{zh ? "学习数据" : "Learning Statistics"}</h3>
            <span className="text-xs font-black text-slate-400 bg-[#F7F9FC] border border-slate-100 rounded-xl px-3 py-1.5">
              {zh ? "本周" : "This Week"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Stat Box 1 */}
            <div className="bg-[#F7F9FC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <span className="text-xs font-extrabold text-slate-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Star className="w-4 h-4 text-[#FACC15]" /> {zh ? "总 XP" : "Total XP"}
              </span>
              <span className="text-3xl font-black text-[#1E293B]">
                {stats.xp.toLocaleString()}
              </span>
              <span className="text-[10px] font-black text-[#6366F1] flex items-center mt-2.5">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +350 this week
              </span>
            </div>

            {/* Stat Box 2 */}
            <div className="bg-[#F7F9FC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <span className="text-xs font-extrabold text-slate-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Timer className="w-4 h-4 text-[#6366F1]" /> {zh ? "学习时间" : "Study Time"}
              </span>
              <span className="text-3xl font-black text-[#1E293B]">
                {Math.floor(stats.studyTimeMinutes / 60)}h {stats.studyTimeMinutes % 60}m
              </span>
              <span className="text-[10px] font-black text-[#6366F1] flex items-center mt-2.5">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +15m vs last week
              </span>
            </div>

            {/* Stat Box 3 */}
            <div className="bg-[#F7F9FC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <span className="text-xs font-extrabold text-slate-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-[#2DD4BF]" /> {zh ? "课程" : "Lessons"}
              </span>
              <span className="text-3xl font-black text-[#1E293B]">
                {stats.lessonsCompleted}
              </span>
              <span className="text-[10px] font-bold text-[#2DD4BF] mt-2.5 uppercase tracking-wider font-extrabold">
                {zh ? "已完成" : "Completed"}
              </span>
            </div>

            {/* Stat Box 4 */}
            <div className="bg-[#F7F9FC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <span className="text-xs font-extrabold text-slate-400 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <SpellCheck className="w-4 h-4 text-[#FB7185]" /> {zh ? "正确率" : "Accuracy"}
              </span>
              <span className="text-3xl font-black text-[#1E293B]">
                {stats.accuracy}%
              </span>
              <span className="text-[10px] font-bold text-[#FB7185] mt-2.5 font-extrabold">
                Avg. Score
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
