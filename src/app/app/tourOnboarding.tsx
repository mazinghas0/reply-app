"use client";

import { useState, useEffect, useCallback } from "react";

interface TourOnboardingProps {
  onComplete: () => void;
}

interface TourStep {
  target: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "tour-tab-bar",
    title: "3가지 기능을 탭으로 전환",
    description: "답장 만들기, 검토, 다듬기 — 원하는 기능을 탭으로 바꿀 수 있어요.",
  },
  {
    target: "tour-message-input",
    title: "받은 메시지를 여기에 붙여넣기",
    description: "답장하고 싶은 메시지를 넣으면 AI가 분석을 시작해요. 공유 메뉴나 클립보드에서 자동으로 가져올 수도 있어요.",
  },
  {
    target: "tour-context-selector",
    title: "맞춤형 답장 — 관계 > 목적 > 전략",
    description: "상대방과의 관계(11종), 답장 목적, 전략(6종)을 선택하면 훨씬 정확한 답장이 나와요.",
  },
  {
    target: "tour-tone-selector",
    title: "답장 톤 선택",
    description: "정중, 단호, 유연, 친근 — 상황에 맞는 톤을 고르세요.",
  },
  {
    target: "tour-generate-button",
    title: "답장 만들기 버튼",
    description: "버튼을 누르거나 Ctrl+Enter로 바로 생성할 수 있어요. 답장 3개가 한 번에 나와요.",
  },
  {
    target: "tour-news-help",
    title: "새 소식",
    description: "업데이트 소식을 확인할 수 있어요. 빨간 점이 뜨면 새 소식이 있다는 뜻이에요.",
  },
  {
    target: "tour-support-button",
    title: "더보기 메뉴",
    description: "고객센터, 서비스 소개, 기능 안내, 설정을 여기서 찾을 수 있어요.",
  },
];

interface ViewportRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourOnboarding({ onComplete }: TourOnboardingProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<ViewportRect | null>(null);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [current.target]);

  useEffect(() => {
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const timer = setTimeout(measure, 350);
    return () => clearTimeout(timer);
  }, [current.target, measure]);

  useEffect(() => {
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const handleNext = () => {
    if (isLast) onComplete();
    else setStep(step + 1);
  };

  if (!rect) {
    return <div className="fixed inset-0 z-[9999] bg-black/50" onClick={onComplete} />;
  }

  const pad = 8;
  const spot = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const tooltipW = Math.min(320, window.innerWidth - 24);
  const tooltipEstH = 220;
  const spaceBelow = window.innerHeight - (spot.top + spot.height);
  const placeBelow = spaceBelow > tooltipEstH + 20;

  let tooltipLeft = spot.left + spot.width / 2 - tooltipW / 2;
  if (tooltipLeft < 12) tooltipLeft = 12;
  if (tooltipLeft + tooltipW > window.innerWidth - 12) {
    tooltipLeft = window.innerWidth - 12 - tooltipW;
  }

  return (
    <div className="fixed inset-0 z-[9999]" onClick={onComplete}>
      {/* 오버레이 + 스포트라이트 */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spot.left}
              y={spot.top}
              width={spot.width}
              height={spot.height}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* 스포트라이트 테두리 */}
      <div
        className="fixed rounded-xl border-2 border-teal-400 pointer-events-none transition-all duration-300"
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.width,
          height: spot.height,
          boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.15)",
        }}
      />

      {/* 툴팁 */}
      <div
        className="fixed animate-fade-in-up"
        style={{
          left: tooltipLeft,
          width: tooltipW,
          ...(placeBelow
            ? { top: spot.top + spot.height + 12 }
            : { bottom: window.innerHeight - spot.top + 12 }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
          {/* 진행 표시 */}
          <div className="flex gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            {current.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {current.description}
          </p>

          {/* 버튼 */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onComplete}
              className="flex-1 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              건너뛰기
            </button>
            <button
              onClick={handleNext}
              className="flex-[2] py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-500 transition-colors cursor-pointer"
            >
              {isLast ? "시작하기" : `다음 (${step + 1}/${TOUR_STEPS.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
