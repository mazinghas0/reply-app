"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/planConfig";

type PaidPlan = Exclude<PlanId, "free">;

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-teal-400 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatPrice(krw: number): string {
  return krw.toLocaleString("ko-KR");
}

interface BuyButtonProps {
  plan: PaidPlan;
  variant: "primary" | "secondary";
}

function BuyButton({ plan, variant }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = "/sign-in?redirect_url=/%23pricing";
        return;
      }

      const data = (await res.json()) as {
        redirect_pc_url?: string;
        redirect_mobile_url?: string;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 503) {
          setError("카카오페이 심사 진행 중입니다. 곧 이용 가능합니다.");
        } else {
          setError(data.error ?? "결제 요청에 실패했습니다.");
        }
        setLoading(false);
        return;
      }

      const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);
      const redirectUrl = isMobile ? data.redirect_mobile_url : data.redirect_pc_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setError("결제 페이지로 이동할 수 없습니다.");
        setLoading(false);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const base = "w-full py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
  const cls =
    variant === "primary"
      ? `${base} bg-teal-600 text-white hover:bg-teal-500`
      : `${base} bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700`;

  return (
    <div className="mt-5 space-y-2">
      <button onClick={handleClick} disabled={loading} className={cls}>
        {loading ? "결제창 여는 중..." : "카카오페이로 구매"}
      </button>
      {error && <p className="text-xs text-rose-400 text-left">{error}</p>}
    </div>
  );
}

export default function PricingSection() {
  const plus = PLANS.plus;
  const pro = PLANS.pro;
  const max = PLANS.max;

  return (
    <section id="pricing" className="px-4 py-24 border-t border-slate-800/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-4">요금제</h2>
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            결제수단: 카카오페이 단독
          </span>
        </div>
        <p className="text-center text-slate-400 mb-14">
          카카오페이로 안전하게 결제하세요 · 1회 이용 시 3크레딧 차감
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
            <p className="text-sm font-semibold text-slate-400 mb-2">Free</p>
            <p className="text-3xl font-bold text-white mb-1">
              0원<span className="text-sm font-normal text-slate-500">/월</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">현재 운영 중</p>
            <ul className="space-y-2 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><CheckIcon />월 10크레딧 (3회 사용)</li>
              <li className="flex items-start gap-2"><CheckIcon />답장 만들기 · 검토 · 말하기</li>
              <li className="flex items-start gap-2"><CheckIcon />입력 500자</li>
            </ul>
            <div className="mt-5">
              <div className="w-full py-2.5 text-sm font-semibold rounded-lg bg-slate-800/60 text-slate-500 text-center">
                현재 이용 중
              </div>
            </div>
          </div>

          {/* Plus */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
            <p className="text-sm font-semibold text-teal-400 mb-2">Plus</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatPrice(plus.price)}원<span className="text-sm font-normal text-slate-500">/월</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">월 자동 갱신</p>
            <ul className="space-y-2 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><CheckIcon />월 {plus.monthlyCredits}크레딧 (23회 사용)</li>
              <li className="flex items-start gap-2"><CheckIcon />입력 800자로 확장</li>
              <li className="flex items-start gap-2"><CheckIcon />내 말투 저장 50건</li>
            </ul>
            <BuyButton plan="plus" variant="secondary" />
          </div>

          {/* Pro */}
          <div className="p-6 rounded-2xl bg-teal-950/30 border border-teal-700/60 flex flex-col relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">
              추천
            </span>
            <p className="text-sm font-semibold text-teal-400 mb-2">Pro</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatPrice(pro.price)}원<span className="text-sm font-normal text-slate-500">/월</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">월 자동 갱신</p>
            <ul className="space-y-2 text-sm text-slate-300 flex-1">
              <li className="flex items-start gap-2"><CheckIcon />월 {pro.monthlyCredits}크레딧 (46회 사용)</li>
              <li className="flex items-start gap-2"><CheckIcon />Sonnet 고품질 AI</li>
              <li className="flex items-start gap-2"><CheckIcon />입력 1,200자</li>
              <li className="flex items-start gap-2"><CheckIcon />내 말투 저장 무제한</li>
            </ul>
            <BuyButton plan="pro" variant="primary" />
          </div>

          {/* Max */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
            <p className="text-sm font-semibold text-violet-400 mb-2">Max</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatPrice(max.price)}원<span className="text-sm font-normal text-slate-500">/월</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">월 자동 갱신</p>
            <ul className="space-y-2 text-sm text-slate-400 flex-1">
              <li className="flex items-start gap-2"><CheckIcon />월 {max.monthlyCredits}크레딧 (106회 사용)</li>
              <li className="flex items-start gap-2"><CheckIcon />Pro의 모든 기능</li>
              <li className="flex items-start gap-2"><CheckIcon />맞춤 키워드 버튼 등록 (Max 전용)</li>
              <li className="flex items-start gap-2"><CheckIcon />우선 고객 지원</li>
            </ul>
            <BuyButton plan="max" variant="secondary" />
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-8">
          모든 플랜: 월 자동 갱신 · 언제든 해지 가능 · 결제 7일 이내 미사용 시 전액 환불 · 자세한 내용은{" "}
          <Link href="/refund" className="text-teal-400 hover:text-teal-300 underline">환불 정책</Link>
          {" "}참고
        </p>
      </div>
    </section>
  );
}
