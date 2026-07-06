import React, { useEffect, useMemo, useRef, useState } from "react";
import { ApiConfig, AppLanguage, LessonCard } from "../types";
import { Volume2, Mic, Ear, Sparkles, BookOpen, Clock, BarChart, ArrowLeft, ArrowRight, HelpCircle, X, Check, Award, RotateCcw, MessageCircle } from "lucide-react";

interface LearnCardProps {
  lesson: LessonCard;
  onPrev: () => void;
  onNext: () => void;
  onAddXP: (xp: number) => void;
  onAddLessonCompleted: () => void;
  isCompleted: boolean;
  language: AppLanguage;
  apiConfig: ApiConfig;
}

export default function LearnCard({
  lesson,
  onPrev,
  onNext,
  onAddXP,
  onAddLessonCompleted,
  isCompleted,
  language,
  apiConfig,
}: LearnCardProps) {
  const zh = language === "zh";
  const [isRecording, setIsRecording] = useState(false);
  const [customSpeechText, setCustomSpeechText] = useState("");
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    accuracyScore: number;
    isCorrect: boolean;
    feedback: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [accent, setAccent] = useState<"en-US" | "en-GB">("en-US");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [learningMode, setLearningMode] = useState<"words" | "sentences" | "review" | null>(null);
  const recognitionRef = useRef<any>(null);

  // Quick Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<"unanswered" | "correct" | "incorrect">("unanswered");
  const [earnedQuizReward, setEarnedQuizReward] = useState(false);
  const [spellingAnswer, setSpellingAnswer] = useState("");

  useEffect(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setIsListening(false);
    setSpeechError("");
    setCustomSpeechText("");
    setEvaluationFeedback(null);
    setShowQuiz(false);
    setSelectedOption(null);
    setQuizStatus("unanswered");
    setEarnedQuizReward(false);
    setSpellingAnswer("");
  }, [lesson.id]);

  // Web speech synthesis (text-to-speech)
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel existing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent;
      // Try to find a professional-sounding English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === accent.toLowerCase()
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleStartPronunciation = () => {
    setIsRecording(true);
    setEvaluationFeedback(null);
    setCustomSpeechText("");
    setSpeechError("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("当前浏览器不支持语音识别，请在下方手动输入你的发音结果。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = accent;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      setCustomSpeechText(transcript);
    };
    recognition.onerror = () => {
      setSpeechError("没有识别到语音，请检查麦克风权限后重试，或直接手动输入。");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const closePronunciationPractice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsRecording(false);
  };

  const handleEvaluatePronunciation = async () => {
    if (!customSpeechText.trim()) return;
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/pronunciation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: lesson.tag2,
          text: customSpeechText,
          provider: apiConfig.provider,
          model: apiConfig.model,
          apiKey: apiConfig.apiKey,
        }),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Pronunciation service unavailable");
      }
      const data = await response.json();
      setEvaluationFeedback(data);
      setIsRecording(false);

      if (data.isCorrect) {
        onAddXP(30); // Reward for correct pronunciation
      } else {
        onAddXP(10); // Encouragement reward
      }
    } catch (error) {
      console.error(error);
      setEvaluationFeedback({
        isCorrect: customSpeechText.toLowerCase() === lesson.tag2.toLowerCase(),
        accuracyScore: customSpeechText.toLowerCase() === lesson.tag2.toLowerCase() ? 100 : 70,
        feedback: "发音整体清晰。请放慢速度，再注意单词重音和尾音完整度。",
      });
      setIsRecording(false);
    } finally {
      setIsEvaluating(false);
    }
  };

  const quizOptions = useMemo(() => {
    const options = [
      { text: lesson.fullDefinition, isCorrect: true },
      ...lesson.quizDistractors.map((text) => ({ text, isCorrect: false })),
    ];
    const offset = Array.from(lesson.id).reduce((total, char) => total + char.charCodeAt(0), 0) % options.length;
    return options.slice(offset).concat(options.slice(0, offset));
  }, [lesson]);

  const handleSelectQuizOption = (index: number) => {
    if (quizStatus !== "unanswered") return;
    setSelectedOption(index);
    if (quizOptions[index].isCorrect) {
      setQuizStatus("correct");
      setEarnedQuizReward(!isCompleted);
      if (!isCompleted) {
        onAddXP(50);
        onAddLessonCompleted();
      }
    } else {
      setQuizStatus("incorrect");
    }
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setQuizStatus("unanswered");
    setEarnedQuizReward(false);
  };

  if (!learningMode) return <div className="max-w-5xl mx-auto min-h-[70vh] flex flex-col justify-center"><p className="text-xs font-black text-[#6366F1] tracking-widest">{zh ? "行业外贸学习" : "INDUSTRY TRADE LEARNING"}</p><h1 className="text-4xl font-black text-[#1E293B] mt-3">{zh ? "今天想训练什么？" : "What would you like to train?"}</h1><p className="text-sm font-semibold text-slate-400 mt-3">{zh ? "系统会结合你的英语与外贸等级调整内容难度。" : "Content adapts to both your English and trade levels."}</p><div className="grid md:grid-cols-3 gap-5 mt-9">{[
    {id:"words",icon:BookOpen,title:zh?"行业词汇":"Industry Words",desc:zh?"专业术语、发音与真实业务释义":"Terms, pronunciation and real business meaning"},
    {id:"sentences",icon:MessageCircle,title:zh?"外贸语句":"Trade Sentences",desc:zh?"邮件、报价、谈判与售后表达":"Email, quotation, negotiation and service"},
    {id:"review",icon:RotateCcw,title:zh?"智能复习":"Smart Review",desc:zh?"根据错误率与遗忘曲线安排":"Scheduled by errors and memory decay"},
  ].map(item=><button key={item.id} onClick={()=>setLearningMode(item.id as typeof learningMode)} className="text-left bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-indigo-200 hover:-translate-y-1 transition-all"><div className="w-12 h-12 rounded-xl bg-slate-50 text-[#6366F1] flex items-center justify-center"><item.icon className="w-6"/></div><h2 className="text-xl font-black text-slate-800 mt-5">{item.title}</h2><p className="text-sm font-semibold text-slate-400 mt-2 leading-relaxed">{item.desc}</p><span className="inline-flex mt-5 text-xs font-black text-[#6366F1]">{zh?"开始训练 →":"Start →"}</span></button>)}</div></div>;

  if (learningMode === "sentences") return <div className="max-w-5xl mx-auto"><div className="flex items-center justify-between"><div><button onClick={()=>setLearningMode(null)} className="text-xs font-black text-slate-400 flex items-center gap-1"><ArrowLeft className="w-4"/>{zh?'切换学习模式':'Change mode'}</button><h1 className="text-3xl font-black text-slate-800 mt-3">{zh?'外贸语句情景训练':'Trade Scenario Sentences'}</h1><p className="text-sm font-semibold text-slate-400 mt-2">{lesson.tag1} · {lesson.tag2}</p></div><span className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black">{lesson.scenarios.length} {zh?'个真实场景':'scenarios'}</span></div><div className="grid md:grid-cols-2 gap-4 mt-7">{lesson.scenarios.map((scenario,index)=><article key={`${scenario.type}-${index}`} className="bg-white border border-slate-100 rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-black text-indigo-500 tracking-widest">{scenario.type.toUpperCase()}</span><button onClick={()=>speakText(scenario.english)} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Volume2 className="w-4"/></button></div><p className="text-lg font-black text-slate-800 leading-relaxed mt-4">{scenario.english}</p><p className="text-sm font-semibold text-slate-400 mt-3">{scenario.translation}</p><button onClick={()=>{setCustomSpeechText(scenario.english);setIsRecording(true)}} className="mt-5 h-10 px-4 rounded-xl border border-indigo-100 text-indigo-600 text-xs font-black flex items-center gap-2"><Mic className="w-4"/>{zh?'跟读这句话':'Shadow this sentence'}</button></article>)}</div><div className="flex justify-between mt-6"><button onClick={onPrev} className="h-11 px-5 border rounded-xl font-black text-sm">{zh?'上一组':'Previous'}</button><button onClick={onNext} className="h-11 px-5 bg-indigo-600 text-white rounded-xl font-black text-sm">{zh?'下一组语句':'Next sentences'}</button></div></div>;

  if (learningMode === "review") return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setLearningMode(null)} className="text-xs font-black text-slate-400 flex items-center gap-1"><ArrowLeft className="w-4" />{zh ? "切换学习模式" : "Change mode"}</button>
      <div className="mt-5 bg-white border border-slate-100 rounded-2xl p-7 grid md:grid-cols-[1fr_240px] gap-7">
        <div>
          <span className="text-xs font-black text-rose-500">{zh ? "智能复习 · 待巩固" : "SMART REVIEW · DUE"}</span>
          <h1 className="text-4xl font-black text-slate-800 mt-3">{lesson.tag2}</h1>
          <p className="text-sm font-semibold text-slate-400 mt-2">{lesson.phonetic}</p>
          <p className="text-base font-semibold text-slate-600 leading-relaxed mt-5">{zh ? lesson.fullDefinitionCn : lesson.fullDefinition}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => speakText(lesson.tag2)} className="h-11 px-4 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm flex items-center gap-2"><Volume2 className="w-4" />{zh ? "听发音" : "Listen"}</button>
            <button onClick={() => { setLearningMode("words"); setShowQuiz(true); }} className="h-11 px-4 rounded-xl bg-indigo-600 text-white font-black text-sm">{zh ? "开始多题型测试" : "Start mixed quiz"}</button>
          </div>
        </div>
        <div className="rounded-xl bg-[#F7F9FC] p-5 flex flex-col justify-center">
          <p className="text-xs font-black text-slate-400">{zh ? "复习原因" : "WHY NOW"}</p>
          <p className="text-sm font-bold text-slate-600 mt-3">{zh ? "该词已进入遗忘临界点。完成释义选择、听音拼写和场景应用后将延后复习。" : "This item is nearing its memory threshold. Complete meaning, spelling and scenario recall."}</p>
          <div className="mt-4 h-2 rounded-full bg-slate-200"><div className="w-2/3 h-full bg-rose-400 rounded-full" /></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-[#F7F9FC] -m-8 relative">
      {/* Left Pane: Core Term & Audio (Sticky/Fixed intent) */}
      <section className="w-full md:w-1/3 bg-white border-r border-slate-100 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#EEF2F6] text-[#6366F1] text-xs font-black border border-slate-100 uppercase tracking-wider">
            {lesson.tag1}
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-[#1E293B] font-sans tracking-tight mb-2">
          {lesson.tag2}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg font-mono text-slate-400 font-bold">
            {lesson.phonetic}
          </span>
          <button
            onClick={() => speakText(lesson.tag2)}
            aria-label="Play pronunciation"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F7F9FC] hover:bg-[#6366F1]/10 hover:text-[#6366F1] transition-all text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6366F1] cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <div className="ml-auto flex rounded-xl bg-[#F7F9FC] p-1 border border-slate-100" aria-label="Pronunciation accent">
            {(["en-US", "en-GB"] as const).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setAccent(language)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                  accent === language ? "bg-[#6366F1] text-white" : "text-slate-400 hover:text-[#6366F1]"
                }`}
                aria-pressed={accent === language}
              >
                {language === "en-US" ? "US" : "UK"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-slate-100 mb-6">
          <h3 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">
            {zh ? "行业释义" : "Industry Definition"}
          </h3>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">
            {lesson.fullDefinition}
          </p>
          <p className="text-xs font-bold text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-200">
            {lesson.fullDefinitionCn}
            <button onClick={() => speakText(lesson.fullDefinition)} className="ml-3 inline-flex w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 items-center justify-center align-middle" title={zh ? "播放行业释义" : "Play definition"}><Volume2 className="w-4"/></button>
          </p>
        </div>

        {/* AI Pronunciation Coach Section */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="p-6 rounded-[24px] border border-[#6366F1]/10 bg-[#EEF2F6]/50 relative overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#6366F1] rounded-l-2xl"></div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-[#6366F1] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4.5 h-4.5 text-[#6366F1]" />
                  {zh ? "发音教练" : "Pronunciation Coach"}
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                  {zh ? "朗读当前术语，获得重音与发音反馈。" : "Record yourself pronouncing this term to receive immediate AI-powered stress & accent analysis."}
                </p>
              </div>
              <button
                onClick={handleStartPronunciation}
                aria-label="Start pronunciation practice"
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md hover:opacity-90 transition-all cursor-pointer ${
                  isListening ? "bg-[#FB7185] text-white animate-pulse" : "bg-[#6366F1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Recording Controls & feedback */}
            {isRecording && (
              <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-1 tracking-wider">
                    {customSpeechText ? "Transcription Captured" : isListening ? "Listening..." : "Ready for input"}
                  </p>
                  <input
                    type="text"
                    value={customSpeechText}
                    onChange={(e) => setCustomSpeechText(e.target.value)}
                    placeholder="Speak clearly or type what the browser recognized..."
                    className="w-full text-sm font-bold text-[#1E293B] bg-transparent border-b border-slate-200 py-1 focus:outline-none focus:border-[#6366F1]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold leading-normal">
                    Speak the target term once, then review the transcript before requesting feedback.
                  </span>
                  {speechError && <span className="text-[10px] text-amber-600 mt-2 block font-bold">{speechError}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEvaluatePronunciation}
                    disabled={isEvaluating || !customSpeechText.trim()}
                    className="flex-1 bg-[#6366F1] text-white text-xs font-black py-3 rounded-xl hover:bg-[#5254de] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isEvaluating ? (zh ? "分析中…" : "Analyzing Accent...") : (zh ? "获取反馈" : "Get Feedback")}
                  </button>
                  <button
                    onClick={closePronunciationPractice}
                    className="px-4 py-3 border border-slate-200 text-slate-500 text-xs font-black rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {zh ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {evaluationFeedback && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#6366F1]/10 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AI Evaluation</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        evaluationFeedback.isCorrect
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {evaluationFeedback.isCorrect ? "Correct" : "Review"}
                    </span>
                    <span className="text-xs font-black text-[#1E293B]">
                      Score: {evaluationFeedback.accuracyScore}%
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {evaluationFeedback.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Right Pane: Context & Scenarios (Scrollable) */}
      <section className="w-full md:w-2/3 p-8 h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-28 md:pb-24">
          {/* Visual Context */}
          <div>
            <h3 className="text-lg font-black text-[#1E293B] mb-4 flex items-center gap-2">
              <Ear className="w-5 h-5 text-slate-400" />
              {zh ? "视觉场景" : "Visual Context"}
            </h3>
            <div className="rounded-[24px] overflow-hidden shadow-sm border border-slate-100 h-72 relative bg-slate-100">
              <img
                alt="Supply chain timeline"
                className="w-full h-full object-cover"
                src={lesson.imageUrl}
              />
            </div>
          </div>

          {/* Business Scenarios */}
          <div>
            <h3 className="text-lg font-black text-[#1E293B] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              {zh ? "商务场景" : "Business Scenarios"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between ${
                    lesson.scenarios.length > 2 && index === 2 ? "md:col-span-2" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                      <span className="text-[10px] font-extrabold text-[#6366F1] uppercase tracking-wider bg-[#EEF2F6] px-2.5 py-1 rounded-full">
                        {scenario.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#1E293B] leading-relaxed mb-3">
                      {/* Highlight core target word */}
                      {scenario.english.split(new RegExp(`(${lesson.tag2})`, "gi")).map((word, i) =>
                        word.toLowerCase() === lesson.tag2.toLowerCase() ? (
                          <span key={i} className="bg-[#6366F1]/10 text-[#6366F1] px-1.5 py-0.5 rounded-lg font-black">
                            {word}
                          </span>
                        ) : (
                          word
                        )
                      )}
                    </p>
                    <div className="pl-3 border-l-2 border-[#2DD4BF]">
                      <p className="text-xs text-slate-400 font-bold italic leading-relaxed">
                        {scenario.translation}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => speakText(scenario.english)}
                    className="mt-4 text-[#6366F1] text-xs font-black hover:underline flex items-center gap-1 self-start cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> {zh ? "播放" : "Listen"} {accent === "en-US" ? "US" : "UK"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-slate-100 shadow-[0_-8px_24px_rgba(0,0,0,0.02)] flex items-center justify-between px-8 z-30">
        <button
          onClick={onPrev}
          className="text-slate-500 hover:text-[#1E293B] transition-colors flex items-center gap-1.5 text-sm font-black cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> {zh ? "上一张" : "Previous Card"}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetQuiz();
              setShowQuiz(true);
            }}
            className="bg-[#EEF2F6] text-[#6366F1] text-sm font-black px-6 py-3 rounded-xl hover:bg-[#6366F1]/10 transition-colors border border-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4.5 h-4.5" /> {zh ? "快速测试" : "Quick Quiz"}
          </button>
          <button
            onClick={onNext}
            className="bg-[#6366F1] text-white text-sm font-black px-6 py-3 rounded-xl hover:bg-[#5254de] transition-colors shadow-[0_4px_12px_rgba(99,102,241,0.2)] flex items-center gap-1.5 cursor-pointer"
          >
            {zh ? "下一张" : "Next Card"} <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl border border-slate-50 flex flex-col gap-5 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowQuiz(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#6366F1] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-[#1E293B] font-sans">
                {zh ? "快速测试" : "Quick Quiz"}
              </h3>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{zh ? "目标术语" : "Target Term"}</p>
              <h4 className="text-2xl font-black text-[#6366F1]">{lesson.tag2}</h4>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-100">
              <p className="text-xs font-black text-slate-500 mb-2">{zh ? "拼写挑战：听发音后输入完整单词" : "Spelling challenge: listen and type the full term"}</p>
              <div className="flex gap-2"><button onClick={() => speakText(lesson.tag2)} className="w-11 h-11 rounded-xl bg-white border text-indigo-600 flex items-center justify-center"><Volume2 className="w-4"/></button><input value={spellingAnswer} onChange={(event) => setSpellingAnswer(event.target.value)} placeholder={zh ? "输入完整拼写" : "Type the spelling"} className="flex-1 min-w-0 h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold"/><button onClick={() => { const correct = spellingAnswer.trim().toLowerCase() === lesson.tag2.trim().toLowerCase(); setQuizStatus(correct ? "correct" : "incorrect"); if (correct && !earnedQuizReward) { onAddXP(20); setEarnedQuizReward(true); } }} className="px-4 h-11 rounded-xl bg-indigo-600 text-white text-xs font-black">{zh ? "检查" : "Check"}</button></div>
            </div>

            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              {zh ? "请选择正确的商务释义：" : <>Identify the correct business definition of <span className="text-[#6366F1] font-black">"{lesson.tag2}"</span>:</>}
            </p>

            <div className="space-y-2.5">
              {quizOptions.map((option, index) => {
                let optionStyle = "border-slate-100 hover:border-[#6366F1]/30 hover:bg-[#6366F1]/5";
                if (selectedOption === index) {
                  if (option.isCorrect) {
                    optionStyle = "border-[#2DD4BF] bg-emerald-50/50 text-emerald-800";
                  } else {
                    optionStyle = "border-[#FB7185] bg-rose-50/50 text-rose-800";
                  }
                } else if (quizStatus !== "unanswered" && option.isCorrect) {
                  // Show correct answer if user got it wrong
                  optionStyle = "border-[#2DD4BF] bg-emerald-50/20 text-emerald-800";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectQuizOption(index)}
                    disabled={quizStatus !== "unanswered"}
                    className={`w-full text-left p-4 rounded-xl border-2 text-sm font-bold leading-relaxed transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black text-slate-400 bg-[#F7F9FC]">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Quiz Result Banner */}
            {quizStatus === "correct" && (
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-[#2DD4BF]/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                    {zh ? "回答正确！" : "Excellent! Correct Answer!"} <Award className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
                  </p>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">
                    {earnedQuizReward ? (zh ? "课程完成，获得 +50 XP。" : "Lesson Completed! You earned +50 XP.") : (zh ? "本课已完成，继续复习巩固吧。" : "Lesson already completed. Keep reviewing!")}
                  </p>
                </div>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="ml-auto bg-[#2DD4BF] text-white text-xs font-black px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {zh ? "继续" : "Continue"}
                </button>
              </div>
            )}

            {quizStatus === "incorrect" && (
              <div className="bg-rose-50/50 rounded-2xl p-4 border border-[#FB7185]/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-800">{zh ? "答案不正确。" : "Incorrect option chosen."}</p>
                  <p className="text-xs text-rose-600 font-bold mt-0.5">
                    {zh ? "复习释义后再试一次。" : "Review the Definition card and try again!"}
                  </p>
                </div>
                <button
                  onClick={resetQuiz}
                  className="ml-auto bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {zh ? "重新测试" : "Retry Quiz"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
