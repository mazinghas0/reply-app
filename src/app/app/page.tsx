"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import RefineTab from "./refineTab";
import ReviewTab from "./reviewTab";
import GenerateTab from "./generateTab";
import QuickActions, { type QuickPick } from "./quickActions";
import { NavAuth, CLERK_ENABLED } from "./planBadge";
import InstallBanner from "./installBanner";
import TourOnboarding from "./tourOnboarding";
import HelpGuide from "./helpGuide";
import NewsPage from "./newsPage";
import SupportChat from "./supportChat";
import ReferralPanel from "./referralPanel";
import SettingsPanel from "./settingsPanel";
import { hasUnreadNews, markNewsSeen } from "./newsData";
import {
  type AppMode,
  type StreakData,
  loadStreak,
  updateStreak,
} from "./shared";
import { IconChat } from "./icons";

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
  const [remaining, setRemaining] = useState<number | null>(null);
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
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [maxInputLength, setMaxInputLength] = useState(100);
  const [allowSonnet, setAllowSonnet] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [monthlyCredits, setMonthlyCredits] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [quickPick, setQuickPick] = useState<QuickPick | null>(null);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMoreMenu]);

  useEffect(() => {
    setStreak(loadStreak());
    if (!localStorage.getItem("reply-tour-done")) {
      setShowOnboarding(true);
    }
    setUnreadNews(hasUnreadNews());

    // 기본 시작 탭
    const savedTab = localStorage.getItem("reply-default-tab");
    if (savedTab && ["generate", "review", "refine"].includes(savedTab)) {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("shared")) setMode(savedTab as AppMode);
    }

    // 글자 크기 (zoom)
    const savedFontSize = localStorage.getItem("reply-font-size");
    if (savedFontSize === "small" || savedFontSize === "large") {
      const el = document.getElementById("app-container");
      if (el) el.style.setProperty("zoom", savedFontSize === "small" ? "0.9" : "1.1");
    }

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
        if (typeof data.maxInputLength === "number") {
          setMaxInputLength(data.maxInputLength);
        }
        if (typeof data.allowSonnet === "boolean") {
          setAllowSonnet(data.allowSonnet);
        }
        if (data.plan) {
          setPlan(data.plan);
        }
        if (typeof data.monthlyCredits === "number") {
          setMonthlyCredits(data.monthlyCredits);
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
    if (localStorage.getItem("reply-clipboard-detect") === "off") return;
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

  return (
    <div id="app-container" className="flex-1 flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
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
        <SettingsPanel onClose={() => setShowSettings(false)} onResetTour={() => setShowOnboarding(true)} plan={plan} />
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
          <div className="flex items-center gap-1.5">
            <button
              data-tour="tour-news-help"
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
            <div ref={moreMenuRef} className="relative">
              <button
                data-tour="tour-support-button"
                onClick={() => setShowMoreMenu((p) => !p)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="더보기"
                title="더보기"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50 animate-fade-in-up">
                  <button
                    onClick={() => { setShowMoreMenu(false); setShowSupport(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 10c0 4-3.13 7-7 7a7.1 7.1 0 0 1-3-.67L3 18l1.67-4A6.93 6.93 0 0 1 3 10c0-4 3.13-7 7-7s7 3 7 7Z" />
                      <path d="M8 9h4M8 12h2" />
                    </svg>
                    고객센터
                  </button>
                  <a
                    href="/?intro"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="14" height="12" rx="2" />
                      <path d="M7 8h6M7 11h4" />
                    </svg>
                    서비스 소개
                  </a>
                  <button
                    onClick={() => { setShowMoreMenu(false); setShowHelp(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="8" />
                      <path d="M7.5 7.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
                      <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
                    </svg>
                    기능 안내
                  </button>
                  <button
                    onClick={() => { setShowMoreMenu(false); setShowSettings(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="10" r="2.5" />
                      <path d="M10 1.5v2M10 16.5v2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M1.5 10h2M16.5 10h2M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" />
                    </svg>
                    설정
                  </button>
                </div>
              )}
            </div>
            {CLERK_ENABLED && <NavAuth remaining={remaining} resetAt={resetAt} onOpenReferral={() => setShowReferral(true)} plan={plan} monthlyCredits={monthlyCredits} />}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full">
        {/* Mode Tabs */}
        <div data-tour="tour-tab-bar" className="w-full flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <button onClick={() => setMode("generate")} className={tabClass(mode === "generate")}>답장 만들기</button>
          <button onClick={() => setMode("review")} className={tabClass(mode === "review")}>답장 검토</button>
          <button onClick={() => setMode("refine")} className={tabClass(mode === "refine")}>말 다듬기</button>
        </div>
        <p className="w-full text-center text-xs text-slate-400 dark:text-slate-500 mt-1.5 mb-5">
          {mode === "generate" ? "받은 메시지를 넣으면 답장 3개를 만들어요" : mode === "review" ? "내가 쓴 답장의 톤과 맞춤법을 분석해요" : "하고 싶은 말을 완성된 메시지 3개로 만들어요"}
        </p>

        {/* 웰컴 메시지 */}
        {showWelcome && (
          <div className="w-full mb-4 p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl animate-fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">가입을 환영해요!</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 leading-relaxed">
                  매달 10크레딧이 무료로 충전돼요. 답장 만들기, 검토, 말 다듬기 모두 3크레딧이에요. 메시지를 붙여넣고 시작해 보세요!
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

        {/* ═══ Generate Mode ═══ */}
        <div className={mode !== "generate" ? "hidden" : "contents"}>
          <QuickActions
            onPick={(pick) => {
              setMode("generate");
              setQuickPick(pick);
            }}
          />
          <GenerateTab
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            remaining={remaining}
            isAuthenticated={isAuthenticated}
            streak={streak}
            clipboardText={mode === "generate" ? clipboardText : null}
            onClipboardUsed={() => setClipboardText(null)}
            onSuccess={() => setStreak(updateStreak())}
            onRemainingUpdate={(n) => setRemaining(n)}
            maxInputLength={maxInputLength}
            allowSonnet={allowSonnet}
            quickPick={quickPick}
            onQuickPickConsumed={() => setQuickPick(null)}
          />
        </div>

        {/* ═══ Review Mode ═══ */}
        <div className={mode !== "review" ? "hidden" : "contents"}>
          <ReviewTab initialDraft={sharedReviewDraft} initialCredits={remaining} onSuccess={() => setStreak(updateStreak())} maxInputLength={maxInputLength} isAuthenticated={isAuthenticated} />
        </div>

        {/* ═══ Refine Mode ═══ */}
        <div className={mode !== "refine" ? "hidden" : "contents"}>
          <RefineTab initialText={sharedRefineText} initialCredits={remaining} onSuccess={() => setStreak(updateStreak())} maxInputLength={maxInputLength} isAuthenticated={isAuthenticated} />
        </div>

        {/* Footer */}
        <footer className="mt-16 mb-4 w-full">
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 pb-2 space-y-3">
            <div className="flex items-center justify-center gap-3 text-xs">
              <Link href="/terms" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">이용약관</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link href="/privacy" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">개인정보 처리방침</Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="mailto:mazingha@kakao.com" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">문의하기</a>
            </div>
            <div className="text-center text-[11px] text-slate-400 dark:text-slate-600 leading-relaxed">
              <p>끌랑(CLang) | 대표: 석광원 | 사업자등록번호: 737-69-00453</p>
              <p>통신판매업: 제 2026-충북증평-0008 호 | 전화: 070-8970-9571</p>
              <p>충북 증평군 증평읍 역전로 90, 1402호</p>
            </div>
            <p className="text-center text-[11px] text-slate-300 dark:text-slate-700">&copy; 2026 Kevin AI Corp &middot; v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
