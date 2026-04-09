"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import RefineTab from "./refineTab";
import ReviewTab from "./reviewTab";
import { NavAuth, CLERK_ENABLED } from "./planBadge";
import ThemeToggle from "./themeToggle";
import InstallBanner from "./installBanner";
import TourOnboarding from "./tourOnboarding";
import HelpGuide from "./helpGuide";
import NewsPage from "./newsPage";
import SupportChat from "./supportChat";
import ReferralPanel from "./referralPanel";
import HistorySection from "./historySection";
import ShareMenu from "./shareMenu";
import SettingsPanel from "./settingsPanel";
import { hasUnreadNews, markNewsSeen } from "./newsData";
import ContextSelector, {
  type ContextSelection,
  getRelationshipLabel,
  getPurposeLabel,
  getStrategyPrompt,
} from "./contextSelector";
import {
  type AppMode,
  type Reply,
  type HistoryEntry,
  type ToneId,
  type Speed,
  type StreakData,
  TONES,
  TONE_STYLES,
  TONE_COLORS,
  SPEEDS,
  HISTORY_KEY,
  loadStreak,
  updateStreak,
  loadHistory,
  saveToHistory,
} from "./shared";
import {
  IconChat,
  IconCopy,
  IconCheck,
  IconError,
  IconSpinner,
} from "./icons";

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
  const [intentHint, setIntentHint] = useState("");
  const [clipboardText, setClipboardText] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streak, setStreak] = useState<StreakData>({ lastDate: "", count: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [unreadNews, setUnreadNews] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sharedRefineText, setSharedRefineText] = useState("");
  const [sharedReviewDraft, setSharedReviewDraft] = useState("");
  const [context, setContext] = useState<ContextSelection>({
    relationship: null,
    relationshipCustom: "",
    purpose: null,
    purposeCustom: "",
    strategy: null,
  });
  const [expandedReplyIndex, setExpandedReplyIndex] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, string[]>>({});
  const [expandLoading, setExpandLoading] = useState(false);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
    setStreak(loadStreak());
    if (!localStorage.getItem("reply-tour-done")) {
      setShowOnboarding(true);
    }
    setUnreadNews(hasUnreadNews());

    // 초기 크레딧 잔액 로드
    fetch("/api/credits")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.credits === "number") {
          setRemaining(data.credits);
        }
        if (data.resetAt) {
          setResetAt(data.resetAt);
        }
        if (data.referralCode) {
          setReferralCode(data.referralCode);
        }
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          // 신규 가입 웰컴 메시지
          if (!localStorage.getItem("reply-welcome-done")) {
            setShowWelcome(true);
            localStorage.setItem("reply-welcome-done", "1");
          }
        }
      })
      .catch(() => {});

    // Web Share Target / Chrome 확장: URL 파라미터로 받은 텍스트 자동 입력
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    if (shared) {
      const modeParam = params.get("mode");
      const validModes: AppMode[] = ["generate", "review", "refine"];
      const targetMode = validModes.includes(modeParam as AppMode) ? (modeParam as AppMode) : "generate";
      setMode(targetMode);
      if (targetMode === "review") {
        setSharedReviewDraft(shared);
      } else if (targetMode === "refine") {
        setSharedRefineText(shared);
      } else {
        setInputMessage(shared);
      }
      window.history.replaceState({}, "", "/app");
    }
  }, []);

  // iOS Safari pull-to-refresh 방지
  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (window.scrollY === 0 && y > startY) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // 클립보드 자동 감지: 앱으로 돌아올 때 클립보드 확인
  const checkClipboard = useCallback(async () => {
    if (inputMessage.trim() || mode !== "generate") return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length >= 5 && text.trim().length <= 2000) {
        setClipboardText(text.trim());
      }
    } catch {
      // 권한 거부 또는 미지원 — 무시
    }
  }, [inputMessage, mode]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkClipboard();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [checkClipboard]);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    setError("");
    setShowLoginHint(false);
    setReplies([]);
    setExpandedReplyIndex(null);
    setExpandedReplies({});
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
          speed,
          hint: intentHint.trim() || undefined,
          relationship: context.relationship
            ? (context.relationship === "custom" ? context.relationshipCustom : getRelationshipLabel(context.relationship))
            : undefined,
          purpose: context.purpose
            ? (context.purpose === "custom" ? context.purposeCustom : getPurposeLabel(context.purpose))
            : undefined,
          strategy: context.strategy ? getStrategyPrompt(context.strategy) : undefined,
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
      // 비로그인 첫 생성 성공 시 로그인 유도
      if (!isAuthenticated && !localStorage.getItem("reply-login-nudge-shown")) {
        setShowLoginNudge(true);
        localStorage.setItem("reply-login-nudge-shown", "1");
      }
      const entry: HistoryEntry = {
        id: String(Date.now()),
        inputMessage: inputMessage.trim(),
        tone: selectedTone,
        speed,
        replies: data.replies,
        createdAt: new Date().toISOString(),
      };
      setHistory(saveToHistory(entry));
      setStreak(updateStreak());
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (replyIndex: number, variant: "stronger" | "softer" | "shorter") => {
    const original = replies[replyIndex]?.content;
    if (!original) return;
    setExpandLoading(true);
    setExpandedReplyIndex(replyIndex);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
          speed,
          expand: { original, variant },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "확장 실패");
      const texts = (data.replies as Reply[]).map((r) => r.content);
      setExpandedReplies((prev) => ({ ...prev, [replyIndex]: texts }));
    } catch {
      // 에러 시 무시
    } finally {
      setExpandLoading(false);
      setExpandedReplyIndex(null);
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
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      <InstallBanner />
      {showOnboarding && (
        <TourOnboarding onComplete={() => { localStorage.setItem("reply-tour-done", "1"); setShowOnboarding(false); }} />
      )}
      {showHelp && (
        <HelpGuide onClose={() => setShowHelp(false)} currentTab={mode} />
      )}
      {showNews && (
        <NewsPage onClose={() => setShowNews(false)} />
      )}
      {showSupport && (
        <SupportChat onClose={() => setShowSupport(false)} />
      )}
      {showReferral && referralCode && (
        <ReferralPanel
          onClose={() => setShowReferral(false)}
          referralCode={referralCode}
          onCreditsUpdate={(c) => setRemaining(c)}
        />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
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
            <button
              data-tour="tour-support-button"
              onClick={() => setShowSupport(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="고객센터"
              title="고객센터"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 10c0 4-3.13 7-7 7a7.1 7.1 0 0 1-3-.67L3 18l1.67-4A6.93 6.93 0 0 1 3 10c0-4 3.13-7 7-7s7 3 7 7Z" />
                <path d="M8 9h4M8 12h2" />
              </svg>
            </button>
            <a
              href="/?intro"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="서비스 소개"
              title="서비스 소개"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="14" height="12" rx="2" />
                <path d="M7 8h6M7 11h4" />
              </svg>
            </a>
            <div data-tour="tour-news-help" className="flex items-center">
            <button
              onClick={() => { setShowNews(true); markNewsSeen(); setUnreadNews(false); }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="새 소식"
              title="새 소식"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3v1M10 16v1M4.5 7a5.5 5.5 0 0 1 11 0c0 3 1 5 1.5 6H3c.5-1 1.5-3 1.5-6Z" />
                <path d="M8 17a2 2 0 0 0 4 0" />
              </svg>
              {unreadNews && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="기능 안내"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" />
                <path d="M7.5 7.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
                <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
              </svg>
            </button>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="설정"
              title="설정"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="2.5" />
                <path d="M10 1.5v2M10 16.5v2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M1.5 10h2M16.5 10h2M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" />
              </svg>
            </button>
            {CLERK_ENABLED && <NavAuth remaining={remaining} resetAt={resetAt} onOpenReferral={() => setShowReferral(true)} />}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full">
        {/* Mode Tabs */}
        <div data-tour="tour-tab-bar" className="w-full flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <button onClick={() => setMode("generate")} className={tabClass(mode === "generate")}>답장 만들기</button>
          <button onClick={() => setMode("review")} className={tabClass(mode === "review")}>답장 검토</button>
          <button onClick={() => setMode("refine")} className={tabClass(mode === "refine")}>다듬기</button>
        </div>
        <p className="w-full text-center text-xs text-slate-400 dark:text-slate-500 mt-1.5 mb-5">
          {mode === "generate" ? "받은 메시지를 넣으면 답장 3개를 만들어요" : mode === "review" ? "내가 쓴 답장의 톤과 맞춤법을 분석해요" : "대충 쓴 문장을 깔끔하게 다듬어요"}
        </p>

        {/* 웰컴 메시지 */}
        {showWelcome && (
          <div className="w-full mb-4 p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl animate-fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">가입을 환영해요!</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 leading-relaxed">
                  매달 50크레딧이 무료로 충전돼요. 답장 만들기, 검토, 다듬기 모두 1크레딧이에요. 메시지를 붙여넣고 시작해 보세요!
                </p>
              </div>
              <button onClick={() => setShowWelcome(false)} className="shrink-0 p-1 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 dark:text-teal-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 클립보드 감지 배너 */}
        {clipboardText && mode === "generate" && (
          <div className="w-full mb-4 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-teal-800 dark:text-teal-300">클립보드에서 메시지를 발견했어요</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 truncate mt-0.5">{clipboardText.substring(0, 50)}{clipboardText.length > 50 ? "..." : ""}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setInputMessage(clipboardText); setClipboardText(null); }}
                className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                붙여넣기
              </button>
              <button
                onClick={() => setClipboardText(null)}
                className="px-2 py-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* ═══ Generate Mode ═══ */}
        {mode === "generate" && <>
          <section className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 transition-colors duration-200">
            {/* Usage badge */}
            {remaining !== null && (
              <div className="flex justify-end">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  remaining <= 5
                    ? "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900"
                    : "bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}>
                  {remaining} 크레딧 남음
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
                data-tour="tour-message-input"
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

            {/* Context Selector (3-step) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">맞춤 설정 <span className="font-normal text-slate-400 dark:text-slate-500">(선택 — 더 정확한 답장)</span></label>
              <div data-tour="tour-context-selector">
                <ContextSelector value={context} onChange={setContext} />
              </div>
            </div>

            {/* Tone Selector (classic) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">답장 톤</label>
              <div data-tour="tour-tone-selector" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
              data-tour="tour-generate-button"
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

                  {/* Expand + Share buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {(["stronger", "softer", "shorter"] as const).map((variant) => {
                      const labels = { stronger: "더 강하게", softer: "더 부드럽게", shorter: "더 짧게" };
                      return (
                        <button
                          key={variant}
                          onClick={() => handleExpand(index, variant)}
                          disabled={expandLoading && expandedReplyIndex === index}
                          className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {expandLoading && expandedReplyIndex === index ? "..." : labels[variant]}
                        </button>
                      );
                    })}
                    <div className="flex-1" />
                    <ShareMenu content={reply.content} index={index} />
                  </div>

                  {/* Expanded replies */}
                  {expandedReplies[index] && (
                    <div className="mt-3 space-y-2">
                      {expandedReplies[index].map((expanded, ei) => (
                        <div key={ei} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                              {["더 강하게", "더 부드럽게", "더 짧게"][ei]}
                            </span>
                            <button
                              onClick={() => handleCopy(expanded, `expand-${index}-${ei}`)}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                                copiedKey === `expand-${index}-${ei}`
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              {copiedKey === `expand-${index}-${ei}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{expanded}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* 로그인 유도 (비로그인 첫 생성 후) */}
          {showLoginNudge && (
            <div className="w-full mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-fade-in-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">이 답장을 저장하고 싶으세요?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    로그인하면 히스토리에 자동 저장되고, 매달 50크레딧을 무료로 받아요.
                  </p>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 mt-2.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                  >
                    무료로 로그인하기
                  </Link>
                </div>
                <button onClick={() => setShowLoginNudge(false)} className="shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <HistorySection
            history={history}
            streak={streak}
            copiedKey={copiedKey}
            onCopy={handleCopy}
            onClearHistory={handleClearHistory}
          />
        </>}

        {/* ═══ Review Mode ═══ */}
        {mode === "review" && <ReviewTab initialDraft={sharedReviewDraft} initialCredits={remaining} onSuccess={() => setStreak(updateStreak())} />}

        {/* ═══ Refine Mode ═══ */}
        {mode === "refine" && <RefineTab initialText={sharedRefineText} initialCredits={remaining} onSuccess={() => setStreak(updateStreak())} />}

        {/* Footer */}
        <footer className="mt-16 mb-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">끌랑(CLang) &middot; Kevin AI Corp &middot; v1.2.0</p>
        </footer>
      </main>
    </div>
  );
}
