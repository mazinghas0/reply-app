"use client";

import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "답장 만들기",
    description: "받은 메시지를 붙여넣고 톤만 고르면\nAI가 자연스러운 답장 3개를 만들어요.",
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
    description: "내가 쓴 답장을 AI가 체크해요.\n맞춤법, 톤, 상대방이 받을 인상까지 분석.",
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
    title: "다듬기",
    description: "대충 쓴 답장도 괜찮아요.\n톤에 맞게 깔끔하게 다듬어 드려요.",
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
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 mb-5">
            {current.icon}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {current.description}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
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
