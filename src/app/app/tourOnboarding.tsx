"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TourOnboardingProps {
  onComplete: () => void;
}

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "tour-tab-bar",
    title: "3가지 기능을 탭으로 전환",
    description: "답장 만들기, 검토, 다듬기 — 원하는 기능을 탭으로 바꿀 수 있어요.",
    position: "bottom",
  },
  {
    target: "tour-message-input",
    title: "받은 메시지를 여기에 붙여넣기",
    description: "답장하고 싶은 메시지를 넣으면 AI가 분석을 시작해요. 공유 메뉴나 클립보드에서 자동으로 가져올 수도 있어요.",
    position: "bottom",
  },
  {
    target: "tour-context-selector",
    title: "맞춤형 답장 — 관계 > 목적 > 전략",
    description: "상대방과의 관계(11종), 답장 목적, 전략(6종)을 선택하면 훨씬 정확한 답장이 나와요.",
    position: "bottom",
  },
  {
    target: "tour-tone-selector",
    title: "답장 톤 선택",
    description: "정중, 단호, 유연, 친근 — 상황에 맞는 톤을 고르세요.",
    position: "bottom",
  },
  {
    target: "tour-generate-button",
    title: "답장 만들기 버튼",
    description: "버튼을 누르거나 Ctrl+Enter로 바로 생성할 수 있어요. 답장 3개가 한 번에 나와요.",
    position: "top",
  },
  {
    target: "tour-support-button",
    title: "궁금한 점은 고객센터에",
    description: "사용 중 문의사항이나 기능 제안이 있으면 여기서 AI 상담원과 대화하세요.",
    position: "bottom",
  },
  {
    target: "tour-news-help",
    title: "새 소식과 도움말",
    description: "업데이트 소식과 기능별 상세 안내를 확인할 수 있어요. 빨간 점이 뜨면 새 소식이 있다는 뜻이에요.",
    position: "bottom",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourOnboarding({ onComplete }: TourOnboardingProps) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const measureTarget = useCallback(() => {
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [current.target]);

  useEffect(() => {
    const timer = setTimeout(measureTarget, 80);
    return () => clearTimeout(timer);
  }, [measureTarget]);

  useEffect(() => {
    const handleResize = () => measureTarget();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureTarget]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!targetRect) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50" onClick={handleSkip} />
    );
  }

  const padding = 8;
  const spotTop = targetRect.top - padding;
  const spotLeft = targetRect.left - padding;
  const spotWidth = targetRect.width + padding * 2;
  const spotHeight = targetRect.height + padding * 2;

  const tooltipMaxWidth = 320;
  let tooltipLeft = spotLeft + spotWidth / 2 - tooltipMaxWidth / 2;
  if (tooltipLeft < 12) tooltipLeft = 12;
  if (tooltipLeft + tooltipMaxWidth > window.innerWidth - 12) {
    tooltipLeft = window.innerWidth - 12 - tooltipMaxWidth;
  }

  const tooltipTop =
    current.position === "bottom"
      ? spotTop + spotHeight + 16
      : spotTop - 16;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* 반투명 오버레이 + 스포트라이트 구멍 */}
      <svg className="absolute inset-0 w-full h-full" style={{ minHeight: document.documentElement.scrollHeight }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotLeft}
              y={spotTop}
              width={spotWidth}
              height={spotHeight}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* 스포트라이트 테두리 */}
      <div
        className="absolute rounded-xl border-2 border-teal-400 pointer-events-none transition-all duration-300"
        style={{
          top: spotTop,
          left: spotLeft,
          width: spotWidth,
          height: spotHeight,
          boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.15)",
        }}
      />

      {/* 툴팁 */}
      <div
        ref={tooltipRef}
        className="absolute animate-fade-in-up"
        style={{
          left: tooltipLeft,
          maxWidth: tooltipMaxWidth,
          ...(current.position === "bottom"
            ? { top: tooltipTop }
            : { top: "auto", bottom: `calc(100% - ${tooltipTop}px)` }),
        }}
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
              onClick={handleSkip}
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
