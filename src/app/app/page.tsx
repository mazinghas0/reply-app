"use client";

import { useState, useEffect } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import RefineTab from "./refineTab";
import ThemeToggle from "./themeToggle";
import InstallBanner from "./installBanner";

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// ─── Types ───────────────────────────────────────

type AppMode = "generate" | "review" | "refine";

interface Reply {
  label: string;
  content: string;
}

interface ReviewResult {
  spelling: Array<{ original: string; corrected: string; reason: string }>;
  tone: { label: string; score: number; detail: string };
  impression: string;
  suggestions: Array<{ original: string; improved: string; reason: string }>;
}

interface HistoryEntry {
  id: string;
  inputMessage: string;
  tone: ToneId;
  speed: Speed;
  replies: Reply[];
  createdAt: string;
}

type Speed = "fast" | "quality";

// ─── Constants ───────────────────────────────────

const TONES = [
  { id: "polite", label: "정중한", desc: "예의 바르고 격식 있는" },
  { id: "firm", label: "단호한", desc: "명확하고 프로페셔널한" },
  { id: "flexible", label: "유연한", desc: "열린 자세, 협상 가능한" },
  { id: "friendly", label: "친근한", desc: "편하고 가벼운" },
] as const;

type ToneId = (typeof TONES)[number]["id"];

const TONE_STYLES: Record<ToneId, { selected: string; hover: string }> = {
  polite: {
    selected: "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-500 dark:ring-blue-900",
    hover: "hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20",
  },
  firm: {
    selected: "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-500 dark:ring-rose-900",
    hover: "hover:border-rose-200 hover:bg-rose-50/50 dark:hover:border-rose-800 dark:hover:bg-rose-900/20",
  },
  flexible: {
    selected: "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500 dark:ring-emerald-900",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/20",
  },
  friendly: {
    selected: "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500 dark:ring-amber-900",
    hover: "hover:border-amber-200 hover:bg-amber-50/50 dark:hover:border-amber-800 dark:hover:bg-amber-900/20",
  },
};

const TONE_COLORS: Record<ToneId, string> = {
  polite: "border-l-blue-400",
  firm: "border-l-rose-400",
  flexible: "border-l-emerald-400",
  friendly: "border-l-amber-400",
};

const SPEEDS: Array<{ id: Speed; label: string; desc: string }> = [
  { id: "quality", label: "정교한 답장", desc: "중요한 비즈니스" },
  { id: "fast", label: "빠른 답장", desc: "일상적인 메시지" },
];

const SPEED_LABELS: Record<Speed, string> = {
  fast: "빠른",
  quality: "정교한",
};

const HISTORY_KEY = "reply-history";
const MAX_HISTORY = 10;

// ─── Icons ───────────────────────────────────────

function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconError() {
  return (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="w-5 h-5" style={{ animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// ─── Utility Functions ───────────────────────────

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveToHistory(entry: HistoryEntry): HistoryEntry[] {
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ─── Nav Auth ────────────────────────────────────

function NavAuth() {
  const { isSignedIn } = useAuth();
  return isSignedIn ? (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 dark:text-slate-500">하루 10회</span>
      <UserButton />
    </div>
  ) : (
    <Link
      href="/sign-in"
      className="text-sm px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
    >
      로그인
    </Link>
  );
}

// ─── Helpers ─────────────────────────────────────

const tabClass = (active: boolean) =>
  `flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
    active
      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700"
      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
  }`;

// ─── Main Component ──────────────────────────────

export default function Home() {
  const [mode, setMode] = useState<AppMode>("generate");
  const [inputMessage, setInputMessage] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneId>("polite");
  const [speed, setSpeed] = useState<Speed>("quality");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [intentHint, setIntentHint] = useState("");
  const [reviewDraft, setReviewDraft] = useState("");
  const [reviewContext, setReviewContext] = useState("");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    setError("");
    setShowLoginHint(false);
    setReplies([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
          speed,
          hint: intentHint.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      if (!res.ok) {
        if (res.status === 429 && data.isAuthenticated === false) {
          setShowLoginHint(true);
        }
        throw new Error(data.error || "답장 생성에 실패했습니다");
      }
      setReplies(data.replies);
      const entry: HistoryEntry = {
        id: String(Date.now()),
        inputMessage: inputMessage.trim(),
        tone: selectedTone,
        speed,
        replies: data.replies,
        createdAt: new Date().toISOString(),
      };
      setHistory(saveToHistory(entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewDraft.trim()) return;
    setReviewLoading(true);
    setReviewError("");
    setReviewResult(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: reviewDraft.trim(),
          context: reviewContext.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "검토에 실패했습니다");
      setReviewResult(data.review);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    setShowHistory(false);
    setExpandedHistoryId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      <InstallBanner />
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/50 transition-colors duration-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
              <IconChat />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">리플라이</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {CLERK_ENABLED && <NavAuth />}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full">
        {/* Mode Tabs */}
        <div className="w-full flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900 mb-6 transition-colors duration-200">
          <button onClick={() => setMode("generate")} className={tabClass(mode === "generate")}>답장 만들기</button>
          <button onClick={() => setMode("review")} className={tabClass(mode === "review")}>답장 검토</button>
          <button onClick={() => setMode("refine")} className={tabClass(mode === "refine")}>다듬기</button>
        </div>

        {/* ═══ Generate Mode ═══ */}
        {mode === "generate" && <>
          <section className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 transition-colors duration-200">
            {/* Usage badge */}
            {remaining !== null && (
              <div className="flex justify-end">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  remaining <= 3
                    ? "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900"
                    : "bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}>
                  오늘 {remaining}회 남음
                </span>
              </div>
            )}

            {/* Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="message-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">받은 메시지</label>
                <span className={`text-xs tabular-nums ${inputMessage.length > 1800 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
                  {inputMessage.length} / 2,000
                </span>
              </div>
              <textarea
                id="message-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="답장하고 싶은 메시지를 여기에 붙여넣으세요..."
                maxLength={2000}
                className="w-full h-36 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
                <span className="ml-0.5">로 바로 생성</span>
              </p>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">답장 톤</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TONES.map((tone) => {
                  const isSelected = selectedTone === tone.id;
                  const styles = TONE_STYLES[tone.id];
                  return (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? styles.selected
                          : `border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${styles.hover}`
                      }`}
                    >
                      <div className="font-semibold">{tone.label}</div>
                      <div className={`text-xs font-normal mt-0.5 ${isSelected ? "opacity-80" : "opacity-60"}`}>{tone.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intent Hint */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                원하는 방향 <span className="font-normal text-slate-400 dark:text-slate-500">(선택)</span>
              </label>
              <input
                type="text"
                value={intentHint}
                onChange={(e) => setIntentHint(e.target.value)}
                placeholder="예: 정중하게 거절, 조건부 수락, 감사 표현, 시간 달라고..."
                maxLength={100}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
              />
            </div>

            {/* Speed Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">답장 품질</label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900">
                {SPEEDS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSpeed(s.id)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      speed === s.id
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-xs font-normal mt-0.5 opacity-60">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!inputMessage.trim() || loading}
              className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-500 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <IconSpinner />
                  AI가 답장을 준비하고 있어요
                </span>
              ) : (
                "답장 만들기"
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-sm">
                <div className="flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                  <IconError />
                  {error}
                </div>
                {showLoginHint && (
                  <Link
                    href="/sign-in"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
                  >
                    로그인하고 10회 사용하기
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Results */}
          {replies.length > 0 && (
            <section className="w-full mt-8 space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">답장 제안</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
              </div>
              {replies.map((reply, index) => (
                <div
                  key={index}
                  className={`animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-2 ${TONE_COLORS[selectedTone]} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{reply.label}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(reply.content, `reply-${index}`)}
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                        copiedKey === `reply-${index}`
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {copiedKey === `reply-${index}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">{reply.content}</p>
                </div>
              ))}
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className="w-full mt-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <IconClock />
                  최근 기록 ({history.length})
                  <IconChevron open={showHistory} />
                </button>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {showHistory && (
                <div className="space-y-2">
                  {history.map((entry) => {
                    const isExpanded = expandedHistoryId === entry.id;
                    const toneLabel = TONES.find((t) => t.id === entry.tone)?.label ?? entry.tone;
                    return (
                      <div key={entry.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{entry.inputMessage}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {toneLabel} · {SPEED_LABELS[entry.speed]} · {formatTime(entry.createdAt)}
                            </p>
                          </div>
                          <IconChevron open={isExpanded} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 space-y-2 border-t border-slate-50 dark:border-slate-800">
                            {entry.replies.map((reply, i) => (
                              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mt-2">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reply.label}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCopy(reply.content, `history-${entry.id}-${i}`); }}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                                      copiedKey === `history-${entry.id}-${i}`
                                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    }`}
                                  >
                                    {copiedKey === `history-${entry.id}-${i}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                                  </button>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1.5 mx-auto mt-2 text-xs text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <IconTrash />
                    기록 모두 삭제
                  </button>
                </div>
              )}
            </section>
          )}
        </>}

        {/* ═══ Review Mode ═══ */}
        {mode === "review" && (
          <>
            <section className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 transition-colors duration-200">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">내가 쓴 답장</label>
                <textarea
                  value={reviewDraft}
                  onChange={(e) => setReviewDraft(e.target.value)}
                  placeholder="검토받고 싶은 답장을 붙여넣으세요..."
                  maxLength={2000}
                  className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  받은 메시지 <span className="font-normal text-slate-400 dark:text-slate-500">(선택)</span>
                </label>
                <textarea
                  value={reviewContext}
                  onChange={(e) => setReviewContext(e.target.value)}
                  placeholder="어떤 메시지에 대한 답장인지 붙여넣으면 더 정확한 검토가 가능해요"
                  maxLength={2000}
                  className="w-full h-20 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
              <button
                onClick={handleReview}
                disabled={!reviewDraft.trim() || reviewLoading}
                className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-500 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {reviewLoading ? <span className="inline-flex items-center gap-2"><IconSpinner />AI가 검토하고 있어요</span> : "답장 검토하기"}
              </button>
              {reviewError && (
                <div className="flex items-start gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
                  <IconError />{reviewError}
                </div>
              )}
            </section>

            {reviewResult && (
              <section className="w-full mt-8 space-y-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">검토 결과</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
                </div>

                {/* Tone */}
                <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">톤 분석</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className={`w-8 h-2.5 rounded-full ${n <= reviewResult.tone.score ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{reviewResult.tone.label}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{reviewResult.tone.detail}</p>
                </div>

                {/* Impression */}
                <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "100ms" }}>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">상대방은 이렇게 느껴요</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{reviewResult.impression}</p>
                </div>

                {/* Spelling */}
                {reviewResult.spelling.length > 0 && (
                  <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "200ms" }}>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">맞춤법 ({reviewResult.spelling.length}건)</h3>
                    <div className="space-y-2">
                      {reviewResult.spelling.map((s, i) => (
                        <div key={i} className="flex items-baseline gap-2 text-sm">
                          <span className="line-through text-rose-400">{s.original}</span>
                          <span className="text-slate-400 dark:text-slate-500">→</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{s.corrected}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">({s.reason})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {reviewResult.suggestions.length > 0 && (
                  <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "300ms" }}>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">개선 제안 ({reviewResult.suggestions.length}건)</h3>
                    <div className="space-y-3">
                      {reviewResult.suggestions.map((s, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-baseline gap-2 text-sm mb-1">
                            <span className="text-slate-500 dark:text-slate-400">{s.original}</span>
                            <span className="text-slate-400 dark:text-slate-500">→</span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">{s.improved}</span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* ═══ Refine Mode ═══ */}
        {mode === "refine" && <RefineTab />}

        {/* Footer */}
        <footer className="mt-16 mb-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">Kevin AI Corp</p>
        </footer>
      </main>
    </div>
  );
}
