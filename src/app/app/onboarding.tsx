"use client";

import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "답장 만들기",
    subtitle: "받은 메시지를 넣으면 AI가 답장을 만들어요",
    tips: [
      { icon: "context", text: "맞춤형 답장 — 관계(11종) > 목적 > 전략(6종) 3단계로 딱 맞는 답장" },
      { icon: "tone", text: "답장 확장 — 더 강하게 / 부드럽게 / 짧게 조절 가능" },
      { icon: "copy", text: "공유 메뉴에서 바로 보내기 + 클립보드 자동 감지" },
    ],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M38 30a2 2 0 0 1-2 2H16l-6 6V14a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.1" />
        <path d="M18 20h12M18 25h8" strokeOpacity="0.6" />
        <circle cx="36" cy="14" r="5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
        <path d="M34 14h4M36 12v4" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "답장 검토",
    subtitle: "내가 쓴 답장을 AI가 꼼꼼히 체크해요",
    tips: [
      { icon: "spell", text: "맞춤법 교정 + 상대방이 받을 인상까지 분석" },
      { icon: "suggest", text: "더 좋은 표현이 있으면 바로 제안해 줘요" },
      { icon: "impression", text: "상황 설명을 추가하면 더 정확한 검토 가능" },
    ],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="8" width="28" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
        <path d="M18 18h12M18 24h8" strokeOpacity="0.5" />
        <circle cx="34" cy="34" r="8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" />
        <path d="M31 34l2 2 4-4" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "말 다듬기",
    subtitle: "하고 싶은 말을 완성된 메시지 3개로 만들어요",
    tips: [
      { icon: "tone", text: "키워드나 메모만 입력하면 AI가 완성된 문장으로" },
      { icon: "compare", text: "핵심 전달형 / 공감·배려형 / 상황 맞춤형 3가지" },
      { icon: "copy", text: "결과를 한 번에 복사해서 메신저에 붙여넣기" },
    ],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="10" width="28" height="14" rx="3" fill="currentColor" fillOpacity="0.1" />
        <path d="M16 17h16" strokeOpacity="0.5" />
        <path d="M24 28v4" strokeOpacity="0.3" strokeDasharray="2 2" />
        <rect x="10" y="32" width="28" height="10" rx="3" fill="currentColor" fillOpacity="0.2" />
        <path d="M16 37h16" strokeOpacity="0.6" />
        <path d="M38 12l4-4M42 8l-1.5 5.5L35 12" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function TipIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 flex-shrink-0";
  switch (type) {
    case "tone":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" /><path d="M5.5 9.5s1 1.5 2.5 1.5 2.5-1.5 2.5-1.5" /><circle cx="6" cy="6.5" r="0.5" fill="currentColor" /><circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
      );
    case "context":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 2v4l2.5 1.5" /><circle cx="8" cy="8" r="6" />
        </svg>
      );
    case "shortcut":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="12" height="8" rx="1.5" /><path d="M5 8h6M8 6v4" />
        </svg>
      );
    case "spell":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 12l3-8h1l3 8M4.5 9h4" /><path d="M12 7l1.5 1.5L12 10" />
        </svg>
      );
    case "impression":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="6" r="3" /><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
        </svg>
      );
    case "suggest":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2" /><circle cx="8" cy="8" r="3" />
        </svg>
      );
    case "compare":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 3v10M12 3v10M4 8h8" />
        </svg>
      );
    case "copy":
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="7" height="8" rx="1" /><path d="M4 11V4a1 1 0 0 1 1-1h5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        {/* Progress */}
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-7 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 mb-4">
            {current.icon}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {current.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* Tips */}
        <div className="px-6 py-4 space-y-2.5">
          {current.tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
            >
              <span className="text-teal-500 dark:text-teal-400">
                <TipIcon type={tip.icon} />
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {tip.text}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            건너뛰기
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-500 transition-colors cursor-pointer"
          >
            {isLast ? "시작하기" : `다음 (${step + 1}/${STEPS.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
