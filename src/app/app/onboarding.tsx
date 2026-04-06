"use client";

import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "메시지를 붙여넣으세요",
    description: "답장하고 싶은 메시지를 복사해서 붙여넣기만 하면 돼요.\n카톡, 이메일, 문자 뭐든 괜찮아요.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="6" width="24" height="32" rx="4" />
        <rect x="10" y="10" width="24" height="32" rx="4" fill="currentColor" fillOpacity="0.1" />
        <path d="M18 20h12M18 26h8" strokeOpacity="0.6" />
      </svg>
    ),
  },
  {
    title: "톤을 골라주세요",
    description: "정중한, 단호한, 유연한, 친근한.\n상황에 맞는 톤 하나만 고르면 돼요.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="24" r="6" fill="currentColor" fillOpacity="0.15" />
        <circle cx="34" cy="24" r="6" fill="currentColor" fillOpacity="0.15" />
        <circle cx="24" cy="12" r="6" fill="currentColor" fillOpacity="0.15" />
        <circle cx="24" cy="36" r="6" fill="currentColor" fillOpacity="0.25" />
      </svg>
    ),
  },
  {
    title: "답장 3개가 바로!",
    description: "AI가 자연스러운 답장 3개를 만들어요.\n마음에 드는 걸 골라서 복사하면 끝.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="32" height="10" rx="3" fill="currentColor" fillOpacity="0.1" />
        <rect x="8" y="22" width="32" height="10" rx="3" fill="currentColor" fillOpacity="0.15" />
        <rect x="8" y="36" width="32" height="10" rx="3" fill="currentColor" fillOpacity="0.2" />
        <path d="M14 13h20M14 27h16M14 41h12" strokeOpacity="0.5" />
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
