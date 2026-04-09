"use client";

import { useState, useEffect } from "react";

// ─── 시나리오 데이터 ─────────────────────────────

const SCENARIOS = [
  {
    message: "내일 오전 10시 회의 참석 가능하신가요? 안건은 Q2 매출 리뷰입니다.",
    replies: [
      { tone: "깔끔 수락", color: "border-l-teal-400", text: "네, 10시 회의 참석하겠습니다. 자료 미리 확인해 둘게요." },
      { tone: "적극 제안", color: "border-l-emerald-400", text: "참석 가능합니다. Q2 데이터 제가 정리해서 미리 공유드릴까요?" },
      { tone: "편한 수락", color: "border-l-amber-400", text: "넵! 10시 회의 갈게요~ Q2 리뷰 준비해서 가겠습니다" },
    ],
  },
  {
    message: "야 이번 주말에 뭐해? 오랜만에 만나자",
    replies: [
      { tone: "쿨한 수락", color: "border-l-teal-400", text: "ㅇㅇ 주말 괜찮아! 어디서 볼까?" },
      { tone: "반가운 수락", color: "border-l-amber-400", text: "오 진짜? 너무 좋지ㅋㅋ 토요일 어때?" },
      { tone: "일정 확인", color: "border-l-emerald-400", text: "토요일은 되는데 일요일은 약속 있어. 토요일 오후 어때?" },
    ],
  },
  {
    message: "교수님 안녕하세요. 과제 제출 기한을 하루만 연장해 주실 수 있을까요?",
    replies: [
      { tone: "정중 요청", color: "border-l-teal-400", text: "교수님 안녕하세요. 자료 조사가 늦어져서 하루만 여유를 주시면 감사하겠습니다." },
      { tone: "사유 설명", color: "border-l-emerald-400", text: "교수님, 참고 논문 2편을 추가로 반영하고 싶어서 여쭙습니다. 내일 오전까지 제출해도 괜찮을까요?" },
      { tone: "간결 요청", color: "border-l-rose-400", text: "교수님, 과제 마무리에 하루가 더 필요합니다. 내일까지 제출해도 될까요?" },
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
