import React, { useState, useRef, useEffect } from "react";
import { ApiConfig, AppLanguage, Coach, ChatMessage, UserProfile } from "../types";
import { Mic, Keyboard, Square, MoreHorizontal, MessageSquare, Lightbulb, User, Plus, Send, AlertCircle } from "lucide-react";

interface PracticeCoachProps {
  coaches: Coach[];
  onAddXP: (xp: number) => void;
  language: AppLanguage;
  apiConfig: ApiConfig;
  profile: UserProfile;
}

export default function PracticeCoach({ coaches, onAddXP, language, apiConfig, profile }: PracticeCoachProps) {
  const zh = language === "zh";
  const [selectedCoachId, setSelectedCoachId] = useState<string>("klaus");
  const [isCustom, setIsCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Conversation history for each coach/scenario
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({
    klaus: [
      {
        id: "msg-1",
        role: "assistant",
        content: "Guten Morgen. I have reviewed your initial proposal for the software integration. Frankly, the timeline seems overly optimistic given the complexity of our legacy systems. How do you plan to mitigate potential delays?",
        timestamp: new Date(),
      },
    ],
    sarah: [
      {
        id: "msg-1",
        role: "assistant",
        content: "Hello Alex! Thanks for hopping on this call. We love your product, but our corporate procurement team is holding a hard line. We need a 15% discount or longer payment terms to sign this quarter. What can you do for us?",
        timestamp: new Date(),
      },
    ],
    custom: [
      {
        id: "msg-1",
        role: "assistant",
        content: "Welcome! To begin our custom English coaching simulation, please type your custom scenario on the left and click 'Set Scenario'.",
        timestamp: new Date(),
      },
    ],
  });

  // Hints history
  const [etiquetteHints, setEtiquetteHints] = useState<Record<string, string>>({
    klaus: "German business culture values directness and concrete data. Avoid vague reassurances. Focus on specific risk management protocols and contingencies.",
    sarah: "US managers appreciate relationship building but are highly transactional. Acknowledge her procurement constraints first, then propose a value trade (like a multi-year term for a discount) instead of conceding instantly.",
    custom: "State your business objectives clearly and use polite but firm professional phrases.",
  });

  const [inputMode, setInputMode] = useState<"text" | "voice">("voice");
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [voiceAccent, setVoiceAccent] = useState<"en-US" | "en-GB">("en-US");

  const speakCoach = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceAccent;
    utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang === voiceAccent) || null;
    window.speechSynthesis.speak(utterance);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedCoachId]);

  const activeHistory = chatHistory[selectedCoachId] || [];
  const activeHint = etiquetteHints[selectedCoachId] || "";

  // Dynamic Suggestion counter-offers based on active coach
  const getSuggestedResponses = () => {
    if (selectedCoachId === "klaus") {
      return [
        "We have built in a 2-week buffer to fully absorb legacy systems testing.",
        "Our plan includes daily integration standups with your local tech leads.",
        "We can deploy senior architects on-site during the critical go-live week.",
      ];
    } else if (selectedCoachId === "sarah") {
      return [
        "We can offer a 10% discount if we sign a 2-year service agreement.",
        "I can adjust the payments to quarterly installments to ease cash flow constraints.",
        "Instead of discounts, we can include 3 months of premium support for free.",
      ];
    } else {
      return [
        "Let us review the specific terms to find a mutually beneficial solution.",
        "I believe we can adjust our operational schedule to match your targets.",
        "Could you outline your key priorities so I can tailor our offer?",
      ];
    }
  };

  const getOfflineCoachResponse = (userText: string) => {
    const lower = userText.toLowerCase();
    if (/price|discount|cost|payment/.test(lower)) {
      return "I can consider that structure, but I need a clear commercial trade-off. What volume, contract term, or payment commitment can you offer in return?";
    }
    if (/delay|timeline|lead time|schedule/.test(lower)) {
      return "Please give me a specific recovery date, the main risk, and one contingency action. I need measurable commitments rather than general reassurance.";
    }
    if (/quality|defect|failure|claim/.test(lower)) {
      return "What evidence supports your conclusion, and when will the corrective action be verified? Please separate containment from the permanent solution.";
    }
    return "Your position is understandable. Please strengthen it with one concrete number, one business benefit, and a clear next step.";
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // 1. Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    const updatedHistory = [...activeHistory, userMessage];
    setChatHistory((prev) => ({
      ...prev,
      [selectedCoachId]: updatedHistory,
    }));

    setTextInput("");
    setRecordingText("");
    setIsRecording(false);
    setIsLoading(true);

    try {
      // 2. Call backend Gemini endpoint
      const response = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoachId,
          messages: updatedHistory.slice(-6), // Send last 6 messages for context
          customPrompt: `${selectedCoachId === "custom" ? customPrompt : ""} User industry: ${profile.industry}; product: ${profile.product}; target market: ${profile.market}. The manager agent should ask for a daily work summary and coach clearer reporting. The customer agent should raise realistic industry objections and professional questions.`,
          provider: apiConfig.provider,
          model: apiConfig.model,
          apiKey: apiConfig.apiKey,
        }),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Coach service unavailable");
      }

      const data = await response.json();

      // 3. Add coach response & update hint
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: "assistant",
        content: data.text || "I understand your point. Let's explore that further.",
        timestamp: new Date(),
      };

      setChatHistory((prev) => ({
        ...prev,
        [selectedCoachId]: [...updatedHistory, coachMessage],
      }));
      speakCoach(coachMessage.content);

      if (data.hint) {
        setEtiquetteHints((prev) => ({
          ...prev,
          [selectedCoachId]: data.hint,
        }));
      }

      onAddXP(20); // Reward active speaking
    } catch (error) {
      const coachMessage: ChatMessage = {
        id: `coach-err-${Date.now()}`,
        role: "assistant",
        content: getOfflineCoachResponse(userText),
        timestamp: new Date(),
      };
      setChatHistory((prev) => ({
        ...prev,
        [selectedCoachId]: [...updatedHistory, coachMessage],
      }));
      setEtiquetteHints((prev) => ({
        ...prev,
        [selectedCoachId]: zh ? "离线陪练模式：先给出结论，再补充一个数字、一项风险控制措施和明确的下一步。" : "Offline coach mode: lead with your conclusion, add one number, one risk-control action, and a clear next step.",
      }));
      onAddXP(10);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = () => {
    setRecordingText("");
    setSpeechError("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInputMode("text");
      setSpeechError("当前浏览器不支持语音识别，已切换到文字输入。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      setRecordingText(transcript);
    };
    recognition.onerror = () => {
      setSpeechError("没有识别到语音，请检查麦克风权限后重试。");
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const selectCoach = (coachId: string) => {
    setSelectedCoachId(coachId);
    setIsCustom(coachId === "custom");
  };

  const handleSetCustomScenario = () => {
    if (!customPrompt.trim()) return;
    setIsEditingCustom(false);
    // Restart custom history
    setChatHistory((prev) => ({
      ...prev,
      custom: [
        {
          id: "custom-1",
          role: "assistant",
          content: `Excellent. I am prepared. Let's start the scenario: "${customPrompt}". What is your opening argument or response?`,
          timestamp: new Date(),
        },
      ],
    }));
    setEtiquetteHints((prev) => ({
      ...prev,
      custom: "Be direct, use strong professional vocabulary, and state your quantitative goals early.",
    }));
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-6 h-[calc(100vh-140px)] -m-4">
      {/* Left Pane: Coach selection list */}
      <aside className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar shrink-0">
        <div className="mb-2">
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">{zh ? "AI 陪练角色" : "AI Coaches"}</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">{zh ? "选择角色开始情景练习。" : "Select an agent to begin your practice."}</p>
        </div>

        {/* Dynamic Coach Cards */}
        {coaches.map((coach) => (
          <button
            key={coach.id}
            onClick={() => selectCoach(coach.id)}
            className={`w-full text-left rounded-[24px] p-5 transition-all border duration-200 group relative cursor-pointer ${
              selectedCoachId === coach.id
                ? "bg-white border-[#6366F1] shadow-md ring-4 ring-[#6366F1]/10"
                : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-4">
              <img
                alt={coach.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                src={coach.avatar}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors mb-0.5">{coach.id === "klaus" ? (zh ? `${profile.industry} 外贸经理` : `${profile.industry} Export Manager`) : (zh ? `${profile.market} 采购客户` : `${profile.market} Buyer`)}</h3>
                <p className="text-xs text-slate-400 font-bold mb-3 line-clamp-2 leading-relaxed">{coach.id === "klaus" ? (zh ? "听取每日工作汇报，纠正表达并给出业务推进建议" : "Reviews your daily report and coaches next actions") : (zh ? `围绕 ${profile.product} 提出真实采购问题与异议` : `Raises realistic purchasing questions about ${profile.product}`)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {coach.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-[#F7F9FC] border border-slate-100 text-slate-500 font-extrabold text-[9px] uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Custom Scenario Button */}
        <button
          onClick={() => selectCoach("custom")}
          className={`w-full text-left rounded-[24px] p-5 transition-all border duration-200 group relative cursor-pointer ${
            selectedCoachId === "custom"
              ? "bg-white border-[#6366F1] shadow-md ring-4 ring-[#6366F1]/10"
              : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2F6] border border-slate-100 flex items-center justify-center text-[#6366F1] shrink-0 shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1E293B] mb-0.5">{zh ? "自定义场景" : "Custom Scenario"}</h3>
              <p className="text-xs text-slate-400 font-bold mb-3 leading-relaxed">{zh ? "创建任意商务对话" : "Engage in any business dialog"}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-[#E0E7FF] text-[#6366F1] font-extrabold text-[9px] uppercase tracking-wider">
                  Tailored Prompt
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* If Custom Scenario Selected, show inputs */}
        {selectedCoachId === "custom" && (
          <div className="bg-[#EEF2F6]/50 border border-[#6366F1]/10 rounded-[24px] p-5 flex flex-col gap-4 animate-in fade-in duration-200">
            <p className="text-xs font-black text-[#6366F1] uppercase tracking-wider">{zh ? "定义自定义场景" : "Define Custom Scenario"}</p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Asking my division VP for an operations budget expansion, explaining a shipping delay, etc."
              rows={4}
              className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366F1] leading-relaxed"
            />
            <button
              onClick={handleSetCustomScenario}
              disabled={!customPrompt.trim()}
              className="bg-[#6366F1] text-white text-xs font-black py-3 rounded-xl hover:bg-[#5254de] transition-all disabled:opacity-40 cursor-pointer text-center font-sans shadow-sm"
            >
              Set Scenario
            </button>
          </div>
        )}
      </aside>

      {/* Right Pane: Conversation Area */}
      <section className="flex-1 flex flex-col bg-white rounded-[32px] shadow-[0_12px_32px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden h-full">
        {/* Header bar */}
        <div className="h-20 border-b border-slate-100 px-6 md:px-8 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                alt="Active Coach"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                src={
                  selectedCoachId === "klaus"
                    ? coaches[0].avatar
                    : selectedCoachId === "sarah"
                    ? coaches[1].avatar
                    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Custom"
                }
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2DD4BF] rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h2 className="text-base font-black text-[#1E293B]">
                {selectedCoachId === "klaus"
                  ? (zh ? `${profile.industry} 外贸经理` : `${profile.industry} Export Manager`)
                  : selectedCoachId === "sarah"
                  ? (zh ? `${profile.market} 采购客户` : `${profile.market} Buyer`)
                  : "Custom AI Negotiator"}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#6366F1] uppercase tracking-widest mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping"></span>
                AI Partner
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-[#F7F9FC] transition-colors cursor-pointer">
            <select value={voiceAccent} onChange={(event) => setVoiceAccent(event.target.value as "en-US" | "en-GB")} className="h-9 rounded-lg border border-slate-200 text-xs font-black px-2"><option value="en-US">US Voice</option><option value="en-GB">UK Voice</option></select>
          </button>
        </div>

        {/* Transcript Messages scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 bg-[#F7F9FC]">
          {activeHistory.map((msg) => {
            const isCoach = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-4 max-w-[85%] ${!isCoach ? "self-end flex-row-reverse" : ""}`}
              >
                {/* Avatar bubble */}
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 mt-0.5 shadow-sm border border-slate-100">
                  {isCoach ? (
                    <img
                      alt="Coach"
                      className="w-full h-full object-cover"
                      src={
                        selectedCoachId === "klaus"
                          ? coaches[0].avatar
                          : selectedCoachId === "sarah"
                          ? coaches[1].avatar
                          : "https://api.dicebear.com/7.x/avataaars/svg?seed=Custom"
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-[#6366F1] flex items-center justify-center text-white">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div
                  className={`rounded-2xl px-5 py-4 shadow-sm border leading-relaxed ${
                    isCoach
                      ? "bg-white border-slate-100 rounded-tl-sm text-[#1E293B]"
                      : "bg-[#6366F1] border-[#6366F1] text-white rounded-tr-sm"
                  }`}
                >
                  <p className="text-sm font-bold whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex items-start gap-4 max-w-[80%]">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 mt-0.5 shadow-sm border border-slate-100">
                <img
                  alt="Coach"
                  className="w-full h-full object-cover"
                  src={
                    selectedCoachId === "klaus"
                      ? coaches[0].avatar
                      : selectedCoachId === "sarah"
                      ? coaches[1].avatar
                      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Custom"
                  }
                />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-[10px] text-[#6366F1] font-black uppercase tracking-wider">Formulating argument...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Business Hint Card Floating Overlay */}
        {activeHint && (
          <div className="px-6 md:px-8 py-4 border-t border-slate-100 bg-[#EEF2F6]/60 flex items-center justify-center shrink-0">
            <div className="w-full bg-white border border-[#6366F1]/10 rounded-2xl p-4 shadow-sm relative overflow-hidden flex gap-4">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#6366F1]"></div>
              <div className="w-8 h-8 rounded-xl bg-[#E0E7FF] flex items-center justify-center text-[#6366F1] shrink-0 mt-0.5">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-[#6366F1] uppercase tracking-wider mb-0.5">
                  {zh ? "商务表达建议" : "Business Etiquette Hint"}
                </h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  {activeHint}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar Section */}
        <div className="border-t border-slate-100 bg-white p-5 shrink-0 flex flex-col gap-4">
          {/* Active recording overlay */}
          {isRecording && (
            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-[18px] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 text-[#FB7185] font-bold text-xs truncate">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FB7185] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FB7185]"></span>
                </span>
                <span className="truncate">{recordingText ? `Listening: "${recordingText}"` : "Listening for your English response..."}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    stopRecording();
                    void handleSendMessage(recordingText);
                  }}
                  disabled={!recordingText}
                  className="bg-[#6366F1] text-white text-[10px] font-black px-4 py-2.5 rounded-xl hover:bg-[#5254de] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {zh ? "发送语音文本" : "Send Speech"}
                </button>
                <button
                  onClick={() => {
                    stopRecording();
                    setRecordingText("");
                  }}
                  className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {zh ? "取消" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {speechError && (
            <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              {speechError}
            </div>
          )}

          {/* Quick Autocomplete Suggestion Counters (Friction-free desktop practice) */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {getSuggestedResponses().map((phrase, i) => (
              <button
                key={i}
                disabled={isLoading || isRecording}
                onClick={() => handleSendMessage(phrase)}
                className="whitespace-nowrap bg-[#F7F9FC] hover:bg-[#6366F1]/10 text-slate-600 hover:text-[#6366F1] border border-slate-200 hover:border-[#6366F1]/20 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-40"
              >
                {phrase}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Keyboard / Mic Mode */}
            <button
              onClick={() => {
                setInputMode(inputMode === "text" ? "voice" : "text");
                stopRecording();
                setSpeechError("");
              }}
              className="w-12 h-12 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-[#F7F9FC] hover:text-[#6366F1] transition-all shrink-0 cursor-pointer"
              title={inputMode === "text" ? "Use Voice Coach" : "Type Response"}
            >
              {inputMode === "text" ? <Mic className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
            </button>

            {/* Input Controls */}
            {inputMode === "text" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(textInput);
                }}
                className="flex-1 flex gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={zh ? "输入你的英文回复…" : `Reply to ${selectedCoachId === "klaus" ? "Klaus" : selectedCoachId === "sarah" ? "Sarah" : "your custom coach"}...`}
                  className="flex-1 px-4 py-3 bg-[#F7F9FC] rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#6366F1] text-[#1E293B]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !textInput.trim()}
                  className="w-12 h-12 bg-[#6366F1] text-white rounded-2xl flex items-center justify-center hover:bg-[#5254de] disabled:opacity-50 shrink-0 cursor-pointer shadow-sm transition-colors"
                >
                  <Send className="w-4.5 h-4.5 ml-0.5" />
                </button>
              </form>
            ) : (
              <div className="flex-1 flex justify-center items-center gap-4">
                {/* Record button */}
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording || isLoading}
                  className="w-16 h-16 rounded-full bg-[#FB7185] text-white flex items-center justify-center shadow-lg hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Start voice response"
                >
                  <Mic className="w-7 h-7 animate-pulse" />
                </button>

                {/* Stop button */}
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="w-11 h-11 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-[#F7F9FC] hover:text-[#FB7185] transition-all shrink-0 cursor-pointer disabled:opacity-45 shadow-sm"
                  title="Stop voice response"
                >
                  <Square className="w-4.5 h-4.5 fill-current" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
