"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

// ─── PlanBadge ──────────────────────────────────

interface PlanBadgeProps {
  remaining: number | null;
  resetAt: string | null;
  onOpenReferral: () => void;
  plan: string | null;
  monthlyCredits: number;
}

export function PlanBadge({ remaining, resetAt, onOpenReferral, plan, monthlyCredits }: PlanBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "done">("idle");
  const [waitlistMsg, setWaitlistMsg] = useState("");

  const handleWaitlist = async () => {
    if (!waitlistEmail.includes("@") || waitlistStatus === "loading") return;
    setWaitlistStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      const data = await res.json();
      setWaitlistMsg(data.message);
      setWaitlistStatus("done");
    } catch {
      setWaitlistMsg("오류가 발생했습니다");
      setWaitlistStatus("done");
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const credits = remaining ?? 0;
  const total = monthlyCredits || 10;
  const pct = Math.round((credits / total) * 100);
  const planLabel = (plan ?? "free").charAt(0).toUpperCase() + (plan ?? "free").slice(1);
  const isPaid = plan === "plus" || plan === "pro" || plan === "max";

  // 리셋일 계산
  const resetLabel = (() => {
    if (!resetAt) return null;
    const d = new Date(resetAt);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  })();

  // 구간별 스타일
  const badge = (() => {
    if (credits <= 0)
      return {
        text: isPaid ? "크레딧 소진" : "업그레이드",
        bg: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        pulse: false,
      };
    if (credits <= 9)
      return {
        text: `${planLabel} · ${credits}`,
        bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        pulse: true,
      };
    if (credits <= 19)
      return {
        text: `${planLabel} · ${credits}`,
        bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        pulse: false,
      };
    return {
      text: planLabel,
      bg: isPaid
        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800"
        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      pulse: false,
    };
  })();

  // 프로그레스 바 색상
  const barColor =
    credits <= 0
      ? "bg-teal-500"
      : credits <= 9
        ? "bg-rose-500"
        : credits <= 19
          ? "bg-amber-500"
          : "bg-teal-500";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${badge.bg}`}
      >
        {badge.text}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4 z-50 animate-fade-in-up">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {credits <= 0 ? "크레딧 소진" : `${planLabel} 플랜`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {credits} / {total} 크레딧
          </p>
          {/* 프로그레스 바 */}
          <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {resetLabel && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              리셋: {resetLabel}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {!isPaid && (
              <Link
                href="/#pricing"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10l4-4v3h10v2H7v3z" transform="rotate(180 10 10)" />
                </svg>
                요금제 업그레이드
              </Link>
            )}
            {!isPaid && (
              waitlistStatus === "done" ? (
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{waitlistMsg}</p>
              ) : (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PRO 출시 알림 받기</p>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="이메일"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-teal-400 transition-all"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWaitlist(); }}
                      disabled={!waitlistEmail.includes("@") || waitlistStatus === "loading"}
                      className="shrink-0 px-2.5 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {waitlistStatus === "loading" ? "..." : "등록"}
                    </button>
                  </div>
                </>
              )
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onOpenReferral(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M12 8v13" />
                <path d="M3 13h18" />
                <path d="M7.5 8C7.5 8 7 3 9.5 3s3.5 2.5 2.5 5" />
                <path d="M16.5 8C16.5 8 17 3 14.5 3S11 5.5 12 8" />
              </svg>
              추천하고 크레딧 받기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NavAuth ────────────────────────────────────

export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function NavAuth({ remaining, resetAt, onOpenReferral, plan, monthlyCredits }: { remaining: number | null; resetAt: string | null; onOpenReferral: () => void; plan: string | null; monthlyCredits: number }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? (
    <div className="flex items-center gap-3">
      <PlanBadge remaining={remaining} resetAt={resetAt} onOpenReferral={onOpenReferral} plan={plan} monthlyCredits={monthlyCredits} />
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
