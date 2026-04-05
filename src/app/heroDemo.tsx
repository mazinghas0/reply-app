"use client";

import { useState, useEffect } from "react";

// ─── 시나리오 데이터 ─────────────────────────────

const SCENARIOS = [
  {
    message: "내일 오전 10시 회의 참석 가능하신가요? 안건은 Q2 매출 리뷰입니다.",
    replies: [
      { tone: "정중", color: "border-l-teal-400", text: "안녕하세요. 내일 오전 10시 회의 참석 가능합니다. Q2 매출 리뷰 안건 확인했습니다. 감사합니다." },
      { tone: "단호", color: "border-l-rose-400", text: "참석하겠습니다. 관련 자료는 미리 공유 부탁드립니다." },
      { tone: "친근", color: "border-l-amber-400", text: "네~ 10시 회의 참석할게요! Q2 리뷰 준비해서 가겠습니다 :)" },
    ],
  },
  {
    message: "견적서 검토 부탁드립니다. 금요일까지 회신 가능하실까요?",
    replies: [
      { tone: "정중", color: "border-l-teal-400", text: "견적서 확인했습니다. 금요일까지 검토 후 회신드리겠습니다. 감사합니다." },
      { tone: "유연", color: "border-l-emerald-400", text: "견적서 잘 받았습니다. 검토 후 수정이 필요한 부분이 있으면 말씀드릴게요." },
      { tone: "단호", color: "border-l-rose-400", text: "확인했습니다. 수요일까지 검토 완료하겠습니다." },
    ],
  },
  {
    message: "프로젝트 마감이 다음 주인데 일정 조율이 필요할 것 같습니다.",
    replies: [
      { tone: "유연", color: "border-l-emerald-400", text: "말씀하신 부분 이해합니다. 우선순위를 조정해서 핵심 기능 위주로 진행하면 어떨까요?" },
      { tone: "정중", color: "border-l-teal-400", text: "일정 관련 말씀 감사합니다. 내일 중으로 조율 미팅을 잡아 말씀드리겠습니다." },
      { tone: "친근", color: "border-l-amber-400", text: "맞아요, 일정이 좀 빠듯하죠? 내일 잠깐 이야기 나눠봐요!" },
    ],
  },
] as const;

type Phase = "message" | "thinking" | "replies" | "fade";

const PHASE_DURATIONS: Record<Phase, number> = {
  message: 2000,
  thinking: 1500,
  replies: 4000,
  fade: 400,
};

// ─── 컴포넌트 ────────────────────────────────────

export default function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("message");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "fade") {
        setIndex((prev) => (prev + 1) % SCENARIOS.length);
        setPhase("message");
      } else {
        const next: Record<Phase, Phase> = {
          message: "thinking",
          thinking: "replies",
          replies: "fade",
          fade: "message",
        };
        setPhase(next[phase]);
      }
    }, PHASE_DURATIONS[phase]);

    return () => clearTimeout(timer);
  }, [phase]);

  const scenario = SCENARIOS[index];
  const isFading = phase === "fade";

  return (
    <div
      className={`w-full max-w-lg mx-auto transition-opacity duration-400 ${isFading ? "opacity-0" : "opacity-100"}`}
    >
      {/* 받은 메시지 */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2 tracking-wide">받은 메시지</p>
        <div className="p-4 bg-slate-800/80 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-slate-300 leading-relaxed">{scenario.message}</p>
        </div>
      </div>

      {/* AI 생성 영역 */}
      <div className="min-h-[180px]">
        {phase === "thinking" && (
          <div className="flex items-center justify-center gap-1.5 py-8">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-teal-400"
                style={{
                  animation: "pulseDot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {(phase === "replies" || phase === "fade") && (
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-slate-500 mb-2 tracking-wide">AI 답장</p>
            {scenario.replies.map((reply, i) => (
              <div
                key={reply.tone}
                className={`p-3.5 bg-slate-800/60 border-l-2 ${reply.color} rounded-lg animate-fade-in-up`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {reply.tone}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed mt-1">{reply.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
