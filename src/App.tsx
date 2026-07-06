import React, { useEffect, useState } from "react";
import { ActiveTab, StudyStats, LessonCard, IngestedDoc, Achievement, UserProfile, ApiConfig, AppLanguage, AssessmentResult } from "./types";
import {
  initialStats,
  initialCoaches,
  initialAchievements,
  initialLessonCards,
  initialIngestedDocs,
  initialProfile,
} from "./data";

// Sub-components
import Sidebar from "./components/Sidebar";
import HomeDashboard from "./components/HomeDashboard";
import LearnCard from "./components/LearnCard";
import PracticeCoach from "./components/PracticeCoach";
import KnowledgeHub from "./components/KnowledgeHub";
import OnboardingFlow from "./components/OnboardingFlow";

// Lucide Icons for Mobile Nav
import { LayoutDashboard, GraduationCap, MessageSquare, Library, Menu, X, Settings } from "lucide-react";

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    if (fallback === null || typeof fallback !== "object") return parsed as T;
    return (Array.isArray(fallback) ? parsed : { ...fallback, ...parsed }) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => (window.localStorage.getItem("proenglish.v1.language") as AppLanguage) || "zh");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [stats, setStats] = useState<StudyStats>(() => loadSaved("proenglish.v1.stats", initialStats));
  const [lessons, setLessons] = useState<LessonCard[]>(() => loadSaved("proenglish.v1.lessons", initialLessonCards));
  const [activeLessonId, setActiveLessonId] = useState<string>(() => window.localStorage.getItem("proenglish.v1.activeLesson") || "lesson-1");
  const [coaches] = useState(initialCoaches);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [documents, setDocuments] = useState<IngestedDoc[]>(() => loadSaved("proenglish.v1.documents", initialIngestedDocs));
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => loadSaved("proenglish.v1.completed", [] as string[]));
  const [profile, setProfile] = useState<UserProfile>(() => loadSaved("proenglish.v1.profile", initialProfile));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [draftGoal, setDraftGoal] = useState(stats.dailyGoalMinutes);
  const [draftWords, setDraftWords] = useState(20);
  const [draftSentences, setDraftSentences] = useState(8);
  const [assistantVisible, setAssistantVisible] = useState(() => window.localStorage.getItem("proenglish.v1.assistant") !== "hidden");
  const [assessment, setAssessment] = useState<AssessmentResult | null>(() => {
    const saved = loadSaved<AssessmentResult | null>("proenglish.v1.assessment", null);
    return saved && saved.englishLevel && saved.tradeLevel && saved.dailyWords && saved.dailySentences && saved.domainScores ? saved : null;
  });
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(() => {
    try {
      const saved = window.sessionStorage.getItem("proenglish.v1.api");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [onboardingComplete, setOnboardingComplete] = useState(() => window.localStorage.getItem("proenglish.v1.onboarding") === "complete");
  const zh = language === "zh";

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.lessons", JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.completed", JSON.stringify(completedLessonIds));
    window.localStorage.setItem("proenglish.v1.activeLesson", activeLessonId);
  }, [completedLessonIds, activeLessonId]);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem("proenglish.v1.language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  // Active lesson card finder
  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // Global State Handlers
  const handleAddMinutes = (mins: number) => {
    setStats((prev) => {
      const nextMins = prev.studyTimeMinutes + mins;
      const nextXP = prev.xp + mins * 10;
      return {
        ...prev,
        studyTimeMinutes: nextMins,
        todayMinutes: Math.min(prev.dailyGoalMinutes, prev.todayMinutes + mins),
        xp: nextXP,
        streak: prev.streak + (prev.studyTimeMinutes === 0 ? 1 : 0),
      };
    });
  };

  const handleAddXP = (xpAmount: number) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpAmount,
    }));
  };

  const handleAddLessonCompleted = () => {
    if (completedLessonIds.includes(activeLessonId)) return;
    setCompletedLessonIds((prev) => [...prev, activeLessonId]);
    setStats((prev) => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
    }));
  };

  const handleAddDocument = (newDoc: IngestedDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const startLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveTab("learn");
  };

  const handlePrevLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : lessons.length - 1;
    setActiveLessonId(lessons[prevIndex].id);
  };

  const createLessonsFromItems = (items: any[], offset: number, learnerProfile: UserProfile, learnerAssessment: AssessmentResult): LessonCard[] => items.map((item, index) => ({
    id: item.id || `ai-lesson-${offset + index}`,
    title: item.word,
    category: item.scenario || learnerProfile.industry,
    description: item.chinese,
    time: "8 min",
    level: learnerAssessment.englishLevel >= 7 ? "Advanced" : learnerAssessment.englishLevel >= 4 ? "Intermediate" : "Beginner",
    imageUrl: initialLessonCards[(offset + index) % initialLessonCards.length].imageUrl,
    fullDefinition: item.phrase,
    fullDefinitionCn: item.phraseCn,
    phonetic: "Tap US or UK to listen",
    tag1: learnerProfile.industry,
    tag2: item.word,
    scenarios: [
      { type: item.scenario || "Business Scene", icon: "mail", title: item.scenario || "Business Scene", english: item.phrase, translation: item.phraseCn },
      { type: "Dialogue", icon: "chat", title: "Customer Dialogue", english: item.dialogue, translation: item.dialogueCn },
    ],
    quizDistractors: ["A general administrative expression.", "A shipping document with no relation to this context.", "An informal phrase not used in business."],
  }));

  const generateLessonBatch = async (nextProfile: UserProfile, nextApi: ApiConfig, nextAssessment: AssessmentResult, offset: number) => {
    const response = await fetch("/api/generate-learning-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: 10, batchOffset: offset, provider: nextApi.provider, model: nextApi.model, apiKey: nextApi.apiKey, profile: { ...nextProfile, englishLevel: nextAssessment.englishLevel, tradeLevel: nextAssessment.tradeLevel, focusAreas: nextAssessment.focusAreas.join(", ") } }) });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.items)) throw new Error(data.error || "Unable to generate lessons");
    return createLessonsFromItems(data.items, offset, nextProfile, nextAssessment);
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);
    const nextIndex = currentIndex < lessons.length - 1 ? currentIndex + 1 : 0;
    setActiveLessonId(lessons[nextIndex].id);
    if (currentIndex >= lessons.length - 2 && apiConfig && assessment) {
      void generateLessonBatch(profile, apiConfig, assessment, lessons.length).then((batch) => setLessons((current) => [...current, ...batch.filter((item) => !current.some((existing) => existing.tag2.toLowerCase() === item.tag2.toLowerCase()))])).catch(() => undefined);
    }
  };

  const openSettings = () => {
    setDraftProfile(profile);
    setDraftGoal(stats.dailyGoalMinutes);
    setDraftWords(assessment?.dailyWords || 20);
    setDraftSentences(assessment?.dailySentences || 8);
    setSettingsOpen(true);
  };

  const saveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const goal = Math.min(180, Math.max(5, Number(draftGoal) || 30));
    setProfile({
      name: draftProfile.name.trim() || "Learner",
      role: draftProfile.role.trim() || "Professional",
      industry: draftProfile.industry.trim() || "General Business",
      product: draftProfile.product.trim() || "Professional Services",
      market: draftProfile.market.trim() || "Global Market",
      learningGoal: draftProfile.learningGoal.trim() || "Professional communication",
    });
    setStats((prev) => ({ ...prev, dailyGoalMinutes: goal, todayMinutes: Math.min(prev.todayMinutes, goal) }));
    if (assessment) {
      const nextAssessment = { ...assessment, dailyWords: Math.min(100, Math.max(5, draftWords)), dailySentences: Math.min(50, Math.max(3, draftSentences)) };
      setAssessment(nextAssessment);
      window.localStorage.setItem("proenglish.v1.assessment", JSON.stringify(nextAssessment));
    }
    window.localStorage.setItem("proenglish.v1.assistant", assistantVisible ? "visible" : "hidden");
    setSettingsOpen(false);
  };

  const completeOnboarding = async (nextProfile: UserProfile, nextApiConfig: ApiConfig, nextAssessment: AssessmentResult) => {
    setProfile(nextProfile);
    setApiConfig(nextApiConfig);
    setAssessment(nextAssessment);
    setOnboardingComplete(true);
    window.sessionStorage.setItem("proenglish.v1.api", JSON.stringify(nextApiConfig));
    window.localStorage.setItem("proenglish.v1.assessment", JSON.stringify(nextAssessment));
    window.localStorage.setItem("proenglish.v1.onboarding", "complete");
    try {
      const generated = await generateLessonBatch(nextProfile, nextApiConfig, nextAssessment, 0);
      setLessons(generated);
      setActiveLessonId(generated[0]?.id || "lesson-1");
    } catch {
      setLessons(initialLessonCards);
    }
  };

  if (!onboardingComplete || !apiConfig || !assessment) {
    return (
      <OnboardingFlow
        language={language}
        setLanguage={setLanguage}
        initialProfile={profile}
        initialApiConfig={apiConfig}
        existingAssessment={assessment}
        initialStep={onboardingComplete ? 1 : 0}
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFC] font-sans antialiased">
      {/* Sidebar for Desktop */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} streak={stats.streak} xp={stats.xp} profile={profile} onOpenSettings={openSettings} language={language} setLanguage={setLanguage} />

      {/* Main app container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header for Mobile */}
        <header className="md:hidden h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-30 shrink-0">
          <span className="font-sans font-black text-xl tracking-tight text-[#6366F1]">
            PRO ENGLISH
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#6366F1]/5 px-3 py-1.5 rounded-full text-xs font-black text-[#6366F1]">
              <span>⚡</span> {stats.streak}d
            </div>
            <button onClick={() => setLanguage(language === "zh" ? "en" : "zh")} className="text-[10px] font-black text-[#6366F1] bg-[#6366F1]/5 px-2.5 py-2 rounded-xl">
              {language === "zh" ? "EN" : "中文"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 z-50 p-4 shadow-xl flex flex-col gap-1.5 animate-in slide-in-from-top-4 duration-200">
            <button
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors font-extrabold text-sm ${
                activeTab === "home" ? "bg-[#6366F1] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="mr-3 w-5 h-5" /> {language === "zh" ? "首页" : "Home"}
            </button>
            <button
              onClick={() => {
                setActiveTab("learn");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors font-extrabold text-sm ${
                activeTab === "learn" ? "bg-[#6366F1] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <GraduationCap className="mr-3 w-5 h-5" /> {language === "zh" ? "学习" : "Learn"}
            </button>
            <button
              onClick={() => {
                setActiveTab("practice");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors font-extrabold text-sm ${
                activeTab === "practice" ? "bg-[#6366F1] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="mr-3 w-5 h-5" /> {language === "zh" ? "陪练" : "Practice"}
            </button>
            <button
              onClick={() => {
                setActiveTab("library");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-xl transition-colors font-extrabold text-sm ${
                activeTab === "library" ? "bg-[#6366F1] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Library className="mr-3 w-5 h-5" /> {language === "zh" ? "知识库" : "Library"}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSettings();
              }}
              className="flex items-center px-4 py-3 rounded-xl transition-colors font-extrabold text-sm text-slate-500 hover:bg-slate-50"
            >
              <Settings className="mr-3 w-5 h-5" /> {language === "zh" ? "个人设置" : "Profile Settings"}
            </button>
          </div>
        )}

        {/* Dynamic Main Body Pane */}
        <main className="flex-1 overflow-y-auto p-8 relative focus:outline-none bg-[#F7F9FC]">
          {activeTab === "home" && (
            <HomeDashboard
              stats={stats}
              addMinutes={handleAddMinutes}
              recommendedLesson={lessons[0]}
              lessons={lessons}
              achievements={achievements}
              startDailyPractice={() => setActiveTab("practice")}
              startLesson={startLesson}
              onReviewCopilot={() => startLesson(lessons[0].id)}
              profile={profile}
              language={language}
              assessment={assessment}
              assistantVisible={assistantVisible}
              apiConfig={apiConfig}
            />
          )}

          {activeTab === "learn" && (
            <LearnCard
              lesson={activeLesson}
              onPrev={handlePrevLesson}
              onNext={handleNextLesson}
              onAddXP={handleAddXP}
              onAddLessonCompleted={handleAddLessonCompleted}
              isCompleted={completedLessonIds.includes(activeLessonId)}
              language={language}
              apiConfig={apiConfig}
            />
          )}

          {activeTab === "practice" && (
            <PracticeCoach coaches={coaches} onAddXP={handleAddXP} language={language} apiConfig={apiConfig} profile={profile} />
          )}

          {activeTab === "library" && (
            <KnowledgeHub
              documents={documents}
              onAddDoc={handleAddDocument}
              onAddXP={handleAddXP}
              language={language}
              apiConfig={apiConfig}
            />
          )}
        </main>

        {/* Mobile Tab Bar Footer (Extra Convenience) */}
        <nav className="md:hidden h-16 bg-white border-t border-slate-100 flex justify-around items-center z-30 shrink-0">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
              activeTab === "home" ? "text-[#6366F1]" : "text-slate-300"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-black mt-1">{language === "zh" ? "首页" : "Home"}</span>
          </button>
          <button
            onClick={() => setActiveTab("learn")}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
              activeTab === "learn" ? "text-[#6366F1]" : "text-slate-300"
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] font-black mt-1">{language === "zh" ? "学习" : "Learn"}</span>
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
              activeTab === "practice" ? "text-[#6366F1]" : "text-slate-300"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-black mt-1">{language === "zh" ? "陪练" : "Practice"}</span>
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors cursor-pointer ${
              activeTab === "library" ? "text-[#6366F1]" : "text-slate-300"
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-black mt-1">{language === "zh" ? "知识" : "Library"}</span>
          </button>
        </nav>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveSettings}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-[28px] border border-slate-100 shadow-2xl p-7"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest">{zh ? "个人学习档案" : "Personal learning profile"}</p>
                <h2 className="text-2xl font-black text-[#1E293B] mt-1">{zh ? "个人设置" : "Profile Settings"}</h2>
                <p className="text-xs font-bold text-slate-400 mt-2">{zh ? "这些信息将用于生成学习简报和后续 AI 内容。" : "These details shape your learning briefing and future AI content."}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ["name", zh ? "称呼" : "Name", zh ? "例如：Lina" : "e.g., Lina"],
                ["role", zh ? "职业" : "Role", zh ? "例如：外贸业务员" : "e.g., Export Sales Manager"],
                ["industry", zh ? "行业" : "Industry", zh ? "例如：线缆设备制造" : "e.g., Cable Equipment Manufacturing"],
                ["product", zh ? "产品 / 服务" : "Product / Service", zh ? "例如：挤出生产线" : "e.g., Extrusion Lines"],
                ["market", zh ? "目标市场" : "Target Market", zh ? "例如：德国和美国" : "e.g., Germany and the US"],
                ["learningGoal", zh ? "学习目标" : "Learning Goal", zh ? "例如：报价谈判和技术演示" : "e.g., Negotiation and technical presentations"],
              ] as const).map(([field, label, placeholder]) => (
                <label key={field} className={field === "market" || field === "learningGoal" ? "sm:col-span-2" : ""}>
                  <span className="block text-xs font-black text-slate-600 mb-2">{label}</span>
                  <input
                    value={draftProfile[field]}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, [field]: event.target.value }))}
                    type="text"
                    placeholder={placeholder}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-[#F7F9FC] text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#6366F1]"
                  />
                </label>
              ))}
              <label><span className="block text-xs font-black text-slate-600 mb-2">{zh ? "每日行业词汇" : "Industry words per day"}</span><input type="number" min="5" max="100" value={draftWords} onChange={(event)=>setDraftWords(Number(event.target.value))} className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-[#F7F9FC] text-sm font-bold"/></label>
              <label><span className="block text-xs font-black text-slate-600 mb-2">{zh ? "每日外贸语句" : "Trade sentences per day"}</span><input type="number" min="3" max="50" value={draftSentences} onChange={(event)=>setDraftSentences(Number(event.target.value))} className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-[#F7F9FC] text-sm font-bold"/></label>
              <label className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[#F7F9FC] border border-slate-100">
                <span className="text-sm font-black text-slate-700">{zh ? "显示首页 AI 成长助手" : "Show AI growth assistant"}</span>
                <input type="checkbox" checked={assistantVisible} onChange={(event) => setAssistantVisible(event.target.checked)} className="w-5 h-5 accent-[#6366F1]" />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
              <button type="button" onClick={() => setSettingsOpen(false)} className="px-5 h-11 rounded-xl border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50">
                {zh ? "取消" : "Cancel"}
              </button>
              <button type="submit" className="px-6 h-11 rounded-xl bg-[#6366F1] text-white text-sm font-black hover:bg-[#5254de] shadow-md shadow-[#6366F1]/10">
                {zh ? "保存档案" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
