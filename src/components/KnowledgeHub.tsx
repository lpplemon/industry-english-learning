import React, { useRef, useState } from "react";
import { ApiConfig, AppLanguage, IngestedDoc } from "../types";
import { FolderHeart, Users, Megaphone, Gavel, CloudUpload, FileText, FileCode, Image, Trash2, Plus, CheckCircle2, X, Network } from "lucide-react";

interface KnowledgeHubProps {
  documents: IngestedDoc[];
  onAddDoc: (doc: IngestedDoc) => void;
  onAddXP: (xp: number) => void;
  language: AppLanguage;
  apiConfig: ApiConfig;
}

export default function KnowledgeHub({ documents, onAddDoc, onAddXP, language, apiConfig }: KnowledgeHubProps) {
  const zh = language === "zh";
  const [activeFolder, setActiveFolder] = useState<"all" | "products" | "customers" | "marketing" | "legal">("all");
  const [mindMapDoc, setMindMapDoc] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<IngestedDoc | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Manual creation states for rich simulation
  const [isTypingDoc, setIsTypingDoc] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledIdsRef = useRef(new Set<string>());

  // Processing items state
  const [processingDocs, setProcessingDocs] = useState<
    { id: string; name: string; progress: number; fileType: string }[]
  >([]);

  const getFileType = (fileName: string): IngestedDoc["fileType"] => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "Word Doc";
    if (/\.(png|jpe?g|webp)$/i.test(lower)) return "Image";
    return "PDF";
  };

  const readFile = async (file: File) => {
    const textExtensions = ["txt", "csv", "md", "json", "html"];
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (textExtensions.includes(extension) || file.type.startsWith("text/")) {
      return (await file.text()).slice(0, 80000);
    }
    return `Imported file: ${file.name}. Type: ${file.type || "unknown"}. Size: ${Math.max(1, Math.round(file.size / 1024))} KB.`;
  };

  const handleFile = async (file: File) => {
    const content = await readFile(file);
    triggerInjestFlow(file.name, content);
  };

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop / Mock file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger rich live injection and backend parse
  const triggerInjestFlow = (fileName: string, content: string) => {
    const id = `proc-${Date.now()}`;
    const fileType = getFileType(fileName);

    const newProcessing = {
      id: id,
      name: fileName,
      progress: 10,
      fileType: fileType,
    };

    setProcessingDocs((prev) => [...prev, newProcessing]);

    // Animate progress on frontend to simulate processing
    let currentProgress = 10;
    const interval = setInterval(() => {
      if (cancelledIdsRef.current.has(id)) {
        clearInterval(interval);
        return;
      }
      currentProgress += 15;
      setProcessingDocs((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, progress: Math.min(95, currentProgress) } : item
        )
      );

      if (currentProgress >= 90) {
        clearInterval(interval);
        // Do backend call to parse
        parseDocumentOnBackend(fileName, content, id);
      }
    }, 400);
  };

  const parseDocumentOnBackend = async (fileName: string, content: string, procId: string) => {
    try {
      const response = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName,
          fileContent: content,
          provider: apiConfig.provider,
          model: apiConfig.model,
          apiKey: apiConfig.apiKey,
        }),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Document parser unavailable");
      }

      const parsed = await response.json();

      const newDoc: IngestedDoc = {
        id: `doc-${Date.now()}`,
        title: parsed.title || fileName.replace(/\.[^/.]+$/, ""),
        fileType: parsed.fileType || "PDF",
        summary: parsed.summary || "A brief strategic outline document processed successfully.",
        tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : ["Strategy"],
        timeString: "Just now",
        keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.slice(0, 6) : [],
        tradePhrases: Array.isArray(parsed.tradePhrases) ? parsed.tradePhrases.slice(0, 6) : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.slice(0, 6) : [],
      };

      // If parsed contains competent image path mockup
      if (parsed.fileType === "Image") {
        newDoc.previewUrl = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80";
      }

      onAddDoc(newDoc);
      onAddXP(40); // Ingest reward!
      showToast(zh ? `“${fileName}”解析完成，获得 +40 XP。` : `Successfully processed and parsed "${fileName}"! +40 XP earned.`);
    } catch (error) {
      const preview = content.replace(/\s+/g, " ").trim().slice(0, 180);
      onAddDoc({
        id: `doc-${Date.now()}`,
        title: fileName.replace(/\.[^/.]+$/, ""),
        fileType: getFileType(fileName),
        summary: preview || "文件已保存。连接 AI 后可继续提取专业词汇、商务表达和知识摘要。",
        tags: [/contract|agreement|terms|合同|条款/i.test(content) ? "Legal" : /customer|buyer|客户|采购/i.test(content) ? "Customers" : /campaign|market|营销|市场/i.test(content) ? "Marketing" : "Products"],
        timeString: "Just now",
      });
      showToast(zh ? `已保存“${fileName}”。连接 AI 后可进行深度解析。` : `Saved "${fileName}". Connect AI for deeper analysis.`);
    } finally {
      // Remove from processing
      setProcessingDocs((prev) => prev.filter((item) => item.id !== procId));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submit typed text
  const handleSubmitTypedDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    triggerInjestFlow(`${docTitle}.docx`, docContent);
    setDocTitle("");
    setDocContent("");
    setIsTypingDoc(false);
  };

  const handleCancelProcessing = (id: string) => {
    cancelledIdsRef.current.add(id);
    setProcessingDocs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToPlan = (title: string) => {
    showToast(`"${title}" added successfully to your personalized vocabulary learning plan! +10 XP earned.`);
    onAddXP(10);
  };

  const folderKeywords: Record<typeof activeFolder, string[]> = {
    all: [],
    products: ["products", "product", "strategy", "technology", "operations"],
    customers: ["customers", "customer", "sales", "persona"],
    marketing: ["marketing", "competitor", "campaign"],
    legal: ["legal", "contract", "compliance"],
  };
  const filteredDocuments = activeFolder === "all" ? documents : documents.filter((doc) => doc.tags.some((tag) => folderKeywords[activeFolder].includes(tag.toLowerCase())));
  const storagePercent = Math.min(100, Math.max(8, documents.length * 6));

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-6 h-[calc(100vh-140px)] -m-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-[#1E293B] text-white px-5 py-4 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white shrink-0 ml-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Left Column: Folders Navigation & Quota */}
      <aside className="w-full md:w-64 flex flex-col gap-6 shrink-0">
        <nav className="flex flex-col gap-1.5">
          <p className="px-4 pb-2 text-[10px] font-black text-slate-400 tracking-widest">{zh ? "AI 自动归类" : "AI AUTO-CATEGORIES"}</p>
          <button onClick={() => setActiveFolder("all")} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold border ${activeFolder === "all" ? "bg-[#6366F1] text-white border-[#6366F1]" : "bg-white text-slate-500 border-slate-100"}`}><FolderHeart className="w-5" />{zh ? "全部知识" : "All Knowledge"}</button>
          <button
            onClick={() => setActiveFolder("products")}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all border cursor-pointer ${
              activeFolder === "products"
                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/10"
                : "text-slate-500 hover:bg-white hover:text-[#1E293B] border-transparent hover:border-slate-100"
            }`}
          >
            <FolderHeart className="w-5 h-5 shrink-0" />
            {zh ? "产品" : "Products"}
          </button>
          <button
            onClick={() => setActiveFolder("customers")}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all border cursor-pointer ${
              activeFolder === "customers"
                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/10"
                : "text-slate-500 hover:bg-white hover:text-[#1E293B] border-transparent hover:border-slate-100"
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            {zh ? "客户" : "Customers"}
          </button>
          <button
            onClick={() => setActiveFolder("marketing")}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all border cursor-pointer ${
              activeFolder === "marketing"
                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/10"
                : "text-slate-500 hover:bg-white hover:text-[#1E293B] border-transparent hover:border-slate-100"
            }`}
          >
            <Megaphone className="w-5 h-5 shrink-0" />
            {zh ? "营销" : "Marketing"}
          </button>
          <button
            onClick={() => setActiveFolder("legal")}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all border cursor-pointer ${
              activeFolder === "legal"
                ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/10"
                : "text-slate-500 hover:bg-white hover:text-[#1E293B] border-transparent hover:border-slate-100"
            }`}
          >
            <Gavel className="w-5 h-5 shrink-0" />
            {zh ? "合同与合规" : "Legal"}
          </button>
        </nav>

        <div className="mt-auto p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black text-[#1E293B] mb-2.5 uppercase tracking-widest">
            {zh ? "知识库容量" : "STORAGE QUOTA"}
          </h3>
          <div className="w-full h-3 bg-[#EEF2F6] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#FB7185] rounded-full" style={{ width: `${storagePercent}%` }}></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs font-bold text-[#1E293B]">
              {storagePercent}% indexed
            </p>
            <p className="text-[10px] font-extrabold text-slate-400">
              {documents.length} {zh ? "份资料" : "documents"}
            </p>
          </div>
        </div>
      </aside>

      {/* Middle Column: Ingestion drag & drop */}
      <section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
        {/* Drag/Drop Ingest Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`rounded-[32px] p-10 border-2 border-dashed flex flex-col items-center justify-center text-center min-h-[300px] transition-all relative group overflow-hidden cursor-pointer ${
            dragActive
              ? "border-[#6366F1] bg-[#6366F1]/5 ring-4 ring-[#6366F1]/5"
              : "border-slate-200 bg-white hover:border-[#6366F1]/40 hover:bg-[#F7F9FC]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/5 to-[#FB7185]/5 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <div className="w-16 h-16 rounded-[22px] bg-[#EEF2F6] flex items-center justify-center text-[#6366F1] mb-5 group-hover:scale-105 transition-all shadow-sm">
            <CloudUpload className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-[#1E293B] mb-1.5 font-sans">
            {zh ? "拖入企业资料" : "Drag & Drop Corporate Docs"}
          </h2>
          <p className="text-xs font-bold text-slate-400 max-w-sm leading-relaxed mb-6">
            {zh ? "上传 PDF、Word、表格、演示文稿或图片，AI 将提取专业词汇、摘要和学习卡片。" : "Upload PDFs, Word files, or presentation reports. AI extracts business terms, creates structural summaries, and generates tailored flashcards."}
          </p>

          <div className="flex gap-3 relative z-10">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.md,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#6366F1] text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-[#5254de] transition-colors shadow-md shadow-[#6366F1]/10 cursor-pointer"
            >
              {zh ? "选择文件" : "Upload File"}
            </button>
            <button
              onClick={() => setIsTypingDoc(!isTypingDoc)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              {zh ? "粘贴文本" : "Paste Text"}
            </button>
          </div>
        </div>

        {/* Input Text Form (Alternative) */}
        {isTypingDoc && (
          <form
            onSubmit={handleSubmitTypedDoc}
            className="bg-white border border-slate-100 rounded-[24px] p-6 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black text-[#6366F1] uppercase tracking-wider">{zh ? "粘贴自定义资料" : "Input Custom Document"}</h4>
              <button
                type="button"
                onClick={() => setIsTypingDoc(false)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-extrabold"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1E293B]">{zh ? "资料标题" : "Document Title"}</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g., Marketing Audit 2024"
                required
                className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1E293B]">{zh ? "资料内容" : "Document Content"}</label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste strategic text, emails, contract definitions, or other corporate material..."
                required
                rows={5}
                className="w-full text-xs font-bold p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6366F1] leading-relaxed"
              />
            </div>
            <button
              type="submit"
              className="bg-[#6366F1] text-white text-xs font-black py-3 rounded-xl hover:bg-[#5254de] transition-colors text-center cursor-pointer shadow-sm"
            >
              {zh ? "使用 AI 解析并导入" : "Parse and Ingest with AI"}
            </button>
          </form>
        )}

        {/* Processing State List */}
        {processingDocs.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[10px] font-black text-[#1E293B] uppercase tracking-widest mb-1">
              {zh ? "正在处理" : "Current Processing"}
            </h3>
            {processingDocs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[24px] p-5 shadow-sm flex items-center gap-4 border border-slate-100 relative overflow-hidden"
              >
                {/* Horizontal processing track progress */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#6366F1] to-[#2DD4BF] transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                ></div>

                <div className="w-11 h-11 rounded-xl bg-[#6366F1]/5 flex items-center justify-center text-[#6366F1] shrink-0">
                  <FileText className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#1E293B] truncate block">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse"></span>
                    <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-wider">
                      AI Parsing... {item.progress}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelProcessing(item.id)}
                  className="text-slate-300 hover:text-[#FB7185] transition-colors cursor-pointer shrink-0 p-2 hover:bg-[#FB7185]/5 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Right Column: Recent Knowledge base */}
      <aside className="w-full md:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
        <div className="flex items-center justify-between mb-1 pb-1">
          <h3 className="text-lg font-black text-[#1E293B] font-sans tracking-tight">{zh ? "最近知识" : "Recent Knowledge"}</h3>
          <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 rounded-lg px-2.5 py-1.5">
            {filteredDocuments.length} ITEMS
          </span>
        </div>

        {/* Knowledge cards list */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-3.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                  {doc.fileType === "Word Doc" ? (
                    <FileText className="w-4 h-4 text-sky-500" />
                  ) : doc.fileType === "Image" ? (
                    <Image className="w-4 h-4 text-purple-500" />
                  ) : (
                    <FileCode className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{doc.fileType}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold">{doc.timeString}</span>
              </div>

              <h4 className="text-sm font-black text-[#1E293B] leading-snug">{doc.title}</h4>

              {/* Summary field */}
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                {doc.summary}
              </p>

              {doc.previewUrl && (
                <div className="w-full h-28 bg-[#EEF2F6] rounded-xl overflow-hidden mt-1 border border-slate-100 shadow-inner">
                  <img
                    alt="Document preview"
                    className="w-full h-full object-cover"
                    src={doc.previewUrl}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-1">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[#E0E7FF] text-[#6366F1] font-extrabold text-[9px] uppercase tracking-wide border border-[#6366F1]/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={(event) => { event.stopPropagation(); handleAddToPlan(doc.title); }}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#F7F9FC] hover:bg-[#6366F1] border border-slate-100 hover:border-[#6366F1] text-[#6366F1] hover:text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {zh ? "加入学习计划" : "Add to Plan"}
              </button>
              <button onClick={(event) => { event.stopPropagation(); setMindMapDoc(mindMapDoc === doc.id ? null : doc.id); }} className="w-full py-2.5 px-4 rounded-xl border border-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center gap-2"><Network className="w-4" />{zh ? "知识思维导图" : "Knowledge Mind Map"}</button>
              {mindMapDoc === doc.id && <div onClick={(event)=>event.stopPropagation()} className="rounded-xl bg-[#F7F9FC] border border-slate-100 p-4 text-center"><div className="inline-flex px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black">{doc.title}</div><div className="h-4 w-px bg-slate-300 mx-auto"/><div className="grid grid-cols-3 gap-2">{[[zh?"核心概念":"Concepts",doc.keyConcepts?.[0]],[zh?"外贸表达":"Trade Phrases",doc.tradePhrases?.[0]],[zh?"行动清单":"Actions",doc.actionItems?.[0]]].map(([title,detail])=><div key={title} className="p-2 bg-white border rounded-lg text-[10px] font-black text-slate-600"><b>{title}</b><p className="font-semibold text-slate-400 mt-1 line-clamp-2">{detail || (zh?"等待 AI 提取":"Awaiting AI extraction")}</p></div>)}</div></div>}
            </div>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="bg-white rounded-[24px] p-6 border border-dashed border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400">{zh ? "这个分类里还没有资料。" : "No documents in this folder yet."}</p>
            </div>
          )}
        </div>
      </aside>
      {selectedDoc && <div className="absolute inset-0 z-40 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-y-auto"><header className="sticky top-0 bg-white/95 backdrop-blur border-b px-7 py-4 flex items-center justify-between"><div><p className="text-[10px] font-black text-indigo-500 tracking-widest">AI KNOWLEDGE NOTE</p><h2 className="text-xl font-black text-slate-800 mt-1">{selectedDoc.title}</h2></div><button onClick={()=>setSelectedDoc(null)} className="w-10 h-10 rounded-xl border flex items-center justify-center"><X className="w-5"/></button></header><article className="max-w-4xl mx-auto px-7 py-9"><p className="text-lg font-semibold text-slate-600 leading-8">{selectedDoc.summary}</p><div className="grid md:grid-cols-3 gap-5 mt-9">{[[zh?'核心概念':'Key Concepts',selectedDoc.keyConcepts],[zh?'外贸表达':'Trade Phrases',selectedDoc.tradePhrases],[zh?'行动清单':'Action Items',selectedDoc.actionItems]].map(([title,items])=><section key={String(title)} className="border border-slate-100 rounded-2xl p-5"><h3 className="text-sm font-black text-slate-800">{String(title)}</h3><ul className="mt-4 space-y-3">{((items as string[])?.length ? items as string[] : [zh?'AI 深度解析后将在此形成结构化内容。':'Structured content appears after AI analysis.']).map(item=><li key={item} className="text-sm font-semibold text-slate-500 leading-relaxed flex gap-2"><span className="text-indigo-500">•</span>{item}</li>)}</ul></section>)}</div><section className="mt-8 bg-[#F7F9FC] rounded-2xl p-6"><div className="flex items-center gap-2"><Network className="w-5 text-indigo-500"/><h3 className="font-black text-slate-800">{zh?'知识关系图':'Knowledge Map'}</h3></div><div className="mt-6 flex flex-col items-center"><div className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black">{selectedDoc.title}</div><div className="w-px h-6 bg-slate-300"/><div className="grid grid-cols-3 gap-4 w-full">{[zh?'核心概念':'Concepts',zh?'外贸表达':'Phrases',zh?'行动应用':'Actions'].map(item=><div key={item} className="bg-white border rounded-xl p-4 text-center text-xs font-black text-slate-600">{item}</div>)}</div></div></section></article></div>}
    </div>
  );
}
