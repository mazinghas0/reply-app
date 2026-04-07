"use client";

import { useState } from "react";

interface HelpGuideProps {
  onClose: () => void;
  currentTab: "generate" | "review" | "refine";
}

interface GuideSection {
  id: "generate" | "review" | "refine";
  title: string;
  description: string;
  tips: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "generate",
    title: "답장 만들기",
    description: "받은 메시지를 넣고 상황을 설정하면 AI가 딱 맞는 답장 3개를 만들어요.",
    tips: [
      "맞춤형 답장: 관계(상사/동료/친구 등 11종) > 목적 > 전략(6종) 3단계 선택",
      "답장 확장: 생성된 답장을 '더 강하게 / 부드럽게 / 짧게' 조절",
      "톤 4종: 정중 / 단호 / 유연 / 친근 — 상황에 맞게 선택",
      "모바일 공유: 안드로이드 공유 메뉴에서 바로 보내기 + 클립보드 자동 감지",
      "빠른/정교한 모드 + Ctrl+Enter 단축키 + 히스토리 보관",
    ],
  },
  {
    id: "review",
    title: "답장 검토",
    description: "내가 쓴 답장을 넣으면 AI가 4가지 관점에서 체크해 줘요.",
    tips: [
      "맞춤법 교정: 틀린 곳을 찾아서 올바른 표현 제안",
      "톤 분석: 내 메시지가 어떤 톤인지 점수로 알려줘요",
      "인상 분석: 상대방이 이 메시지를 받으면 어떤 느낌일지 예측",
      "개선 제안: 어색한 문장을 더 자연스러운 표현으로 추천",
      "상황 설명을 추가하면 맥락을 고려한 더 정확한 검토 가능",
    ],
  },
  {
    id: "refine",
    title: "다듬기",
    description: "대충 쓴 답장도 톤에 맞게 깔끔하게 다듬어 드려요.",
    tips: [
      "톤 5종: 자연스럽게 / 정중 / 단호 / 유연 / 친근",
      "AI 느낌 제거: 실제 한국인이 카톡에서 쓰는 문체로 변환",
      "원문 비교: 다듬기 전후를 나란히 비교해서 차이 확인",
      "한 번에 복사해서 메신저에 바로 붙여넣기",
    ],
  },
];

const GENERAL_TIPS = [
  { label: "사용량", text: "로그인 시 각 기능 10회/일, 비로그인 5회/일" },
  { label: "PWA", text: "홈 화면에 추가하면 앱처럼 사용할 수 있어요" },
  { label: "공유", text: "안드로이드 공유 메뉴에서 리플라이로 바로 보낼 수 있어요" },
];

export default function HelpGuide({ onClose, currentTab }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "review" | "refine">(currentTab);
  const activeSection = SECTIONS.find((s) => s.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">기능 안내</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 mx-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === s.id
                  ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content — Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Section Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeSection.description}
          </p>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">사용 팁</p>
            {activeSection.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
              >
                <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>

          {/* General Tips */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">알아두면 좋은 것</p>
            {GENERAL_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-md flex-shrink-0">
                  {tip.label}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-500 transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
