"use client";

import { useState, useEffect, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type BannerType = "android" | "ios" | null;

const DISMISS_KEY = "reply-pwa-dismiss";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Date.now() - ts < DISMISS_DAYS * 86400000;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone: boolean }).standalone)
  );
}

export default function InstallBanner() {
  const [bannerType, setBannerType] = useState<BannerType>(null);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    // Android / Chrome: beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setBannerType("android");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: no event, show manual guide
    if (isIos()) {
      setBannerType("ios");
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    setInstalling(true);
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setBannerType(null);
    }
    deferredPrompt.current = null;
    setInstalling(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setBannerType(null);
  };

  if (!bannerType) return null;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl border border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-950/30 px-4 py-3 flex items-start gap-3 animate-in">
      {/* 아이콘 */}
      <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
          홈 화면에 추가하기
        </p>

        {bannerType === "android" && (
          <>
            <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
              앱처럼 바로 열 수 있어요
            </p>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="mt-2 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {installing ? "설치 중..." : "설치하기"}
            </button>
          </>
        )}

        {bannerType === "ios" && (
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5 leading-relaxed">
            <span className="inline-flex items-center gap-1">
              하단
              <svg className="w-4 h-4 inline -mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              공유 버튼
            </span>
            {" → "}
            <strong>홈 화면에 추가</strong>를 눌러주세요
          </p>
        )}
      </div>

      {/* 닫기 */}
      <button
        onClick={handleDismiss}
        className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
        aria-label="닫기"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 dark:text-teal-400">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
