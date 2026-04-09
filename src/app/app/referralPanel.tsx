"use client";

import { useState } from "react";
import { IconGift, IconShare, IconCopy, IconCheck } from "./icons";
import { REFERRAL_BONUS } from "./shared";

interface ReferralPanelProps {
  onClose: () => void;
  referralCode: string;
  onCreditsUpdate: (newCredits: number) => void;
}

export default function ReferralPanel({ onClose, referralCode, onCreditsUpdate }: ReferralPanelProps) {
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: "리플라이 - AI 답장 도우미",
      text: `리플라이에서 추천 코드 ${referralCode}를 입력하면 ${REFERRAL_BONUS} 크레딧을 받을 수 있어요!`,
      url: "https://aireply.co.kr",
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = async () => {
    if (!inputCode.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode.trim() }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setInputCode("");
        // 크레딧 갱신
        const creditsRes = await fetch("/api/credits");
        const creditsData = await creditsRes.json();
        if (typeof creditsData.credits === "number") {
          onCreditsUpdate(creditsData.credits);
        }
      }
    } catch {
      setResult({ success: false, message: "오류가 발생했습니다" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in-up overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <IconGift />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">추천하기</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">친구와 함께 크레딧 받기</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 내 추천 코드 */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">내 추천 코드</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold text-teal-600 dark:text-teal-400 tracking-widest text-center select-all">
                {referralCode}
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 p-3 rounded-xl border transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400"
                }`}
              >
                {copied ? <IconCheck /> : <IconCopy />}
              </button>
            </div>
          </div>

          {/* 공유 버튼 */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <IconShare />
            친구에게 공유하기
          </button>

          {/* 안내 */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              친구가 내 추천 코드를 입력하면, <span className="font-semibold text-teal-600 dark:text-teal-400">나와 친구 모두 {REFERRAL_BONUS} 크레딧</span>을 받아요. 추천 코드는 1회만 사용할 수 있어요.
            </p>
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500">추천 코드 입력</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* 코드 입력 */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">친구의 추천 코드가 있나요?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="RE-XXXXXX"
                maxLength={9}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tracking-wider text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
              />
              <button
                onClick={handleApply}
                disabled={!inputCode.trim() || loading}
                className="shrink-0 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? "..." : "적용"}
              </button>
            </div>
          </div>

          {/* 결과 메시지 */}
          {result && (
            <div className={`px-4 py-3 rounded-xl text-sm ${
              result.success
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            }`}>
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
