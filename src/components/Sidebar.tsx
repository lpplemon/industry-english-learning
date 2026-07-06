import { ActiveTab, AppLanguage, UserProfile } from "../types";
import { LayoutDashboard, GraduationCap, MessageSquare, Library, Settings, Flame } from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streak: number;
  xp: number;
  profile: UserProfile;
  onOpenSettings: () => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export default function Sidebar({ activeTab, setActiveTab, streak, xp, profile, onOpenSettings, language, setLanguage }: SidebarProps) {
  const zh = language === "zh";
  return (
    <aside className="w-72 bg-[#6366F1] m-4 rounded-[40px] flex flex-col p-8 text-white relative overflow-hidden hidden md:flex h-[calc(100vh-2rem)] z-40 shadow-[0_12px_32px_rgba(99,102,241,0.15)]">
      {/* Absolute circle decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full pointer-events-none"></div>

      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-12 relative z-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-[#6366F1] rounded-sm"></div>
        </div>
        <span className="text-2xl font-black tracking-tight">PRO.EN</span>
      </div>

      <div className="flex p-1 rounded-xl bg-white/10 mb-6 relative z-10">
        <button onClick={() => setLanguage("zh")} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${zh ? "bg-white text-[#6366F1]" : "text-white/60"}`}>中文</button>
        <button onClick={() => setLanguage("en")} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${!zh ? "bg-white text-[#6366F1]" : "text-white/60"}`}>EN</button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow flex flex-col gap-4 relative z-10">
        {/* Home */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 text-left w-full ${
            activeTab === "home"
              ? "bg-white/20 font-bold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-bold text-sm">{zh ? "学习概览" : "Dashboard"}</span>
        </button>

        {/* Learn */}
        <button
          onClick={() => setActiveTab("learn")}
          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 text-left w-full ${
            activeTab === "learn"
              ? "bg-white/20 font-bold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-bold text-sm">{zh ? "专业词汇学习" : "Learn Terminology"}</span>
        </button>

        {/* Practice */}
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 text-left w-full ${
            activeTab === "practice"
              ? "bg-white/20 font-bold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-bold text-sm">{zh ? "AI 口语陪练" : "AI Speaking Coach"}</span>
        </button>

        {/* Library */}
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 text-left w-full ${
            activeTab === "library"
              ? "bg-white/20 font-bold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="font-bold text-sm">{zh ? "知识中心" : "Knowledge Hub"}</span>
        </button>
      </nav>

      {/* Bottom Stats Widget */}
      <div className="mt-auto bg-[#818CF8] p-5 rounded-[32px] mb-6 relative z-10">
        <p className="text-xs opacity-80 mb-1 flex items-center gap-1.5 font-semibold">
          <Flame className="w-3.5 h-3.5" /> {zh ? "连续学习" : "Study Streak"}
        </p>
        <p className="text-3xl font-black">{streak} {zh ? "天" : "Days"}</p>
        <div className="mt-4 w-full bg-white/20 h-2 rounded-full">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }}
          ></div>
        </div>
        <p className="text-[10px] opacity-75 mt-1.5 font-bold">
          {xp % 1000} / 1000 XP {zh ? "升级进度" : "to Level Up"}
        </p>
      </div>

      {/* Profile Footer */}
      <div className="pt-4 border-t border-white/10 relative z-10">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-3 rounded-xl transition-colors cursor-pointer group w-full text-left"
          aria-label="Open profile settings"
        >
          <div className="relative">
            <img
              alt="Executive Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-white/50 transition-colors"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            />
            {streak >= 10 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FB7185] text-[9px] font-bold text-white shadow">
                ⚡
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-snug">
              {profile.name}
            </p>
            <p className="text-xs text-white/70 font-medium truncate">{profile.role}</p>
          </div>
          <Settings className="w-4 h-4 text-white/50 group-hover:text-white transition-colors ml-auto" />
        </button>
      </div>
    </aside>
  );
}
