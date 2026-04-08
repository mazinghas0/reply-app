"use client";

import { useState } from "react";
import Link from "next/link";

// ─── 시나리오 데이터 ─────────────────────────────

const SCENARIOS = [
  {
    label: "직장 회의",
    icon: "briefcase",
    message: "내일 오전 10시 회의 참석 가능하신가요? 안건은 Q2 매출 리뷰입니다.",
    tone: "polite" as const,
    relationship: "boss",
    purpose: "schedule",
  },
  {
    label: "과제 마감",
    icon: "school",
    message: "교수님, 과제 제출 기한을 하루만 연장해주실 수 있을까요? 자료 정리가 조금 더 필요합니다.",
    tone: "flexible" as const,
    relationship: "colleague",
    purpose: "reject",
  },
  {
    label: "썸 답장",
    icon: "heart",
    message: "어제 보내준 노래 좋더라~ 요즘 이런 장르 많이 듣는 거야?",
    tone: "friendly" as const,
    relationship: "crush",
    purpose: "react",
  },
];

const TONE_LABELS: Record<string, string> = {
  polite: "정중",
  firm: "단호",
  flexible: "유연",
  friendly: "친근",
};

const TONE_COLORS: Record<string, string> = {
  polite: "border-l-blue-400",
  firm: "border-l-rose-400",
  flexible: "border-l-emerald-400",
  friendly: "border-l-amber-400",
};

interface Reply {
  label: string;
  content: string;
}

type Phase = "select" | "loading" | "result";

// ─── 아이콘 ─────────────────────────────────────

function ScenarioIcon({ type }: { type: string }) {
  const cls = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0";
  switch (type) {
    case "briefcase":
      return (
        <div className={`${cls} bg-blue-950/50 text-blue-400`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
      );
    case "school":
      return (
        <div className={`${cls} bg-violet-950/50 text-violet-400`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
          </svg>
        </div>
      );
    case "heart":
      return (
        <div className={`${cls} bg-rose-950/50 text-rose-400`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

// ─── 메인 컴포넌트 ──────────────────────────────

export default function TrialModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [error, setError] = useState("");

  const handleSelect = async (index: number) => {
    setSelectedIndex(index);
    setPhase("loading");
    setError("");

    const scenario = SCENARIOS[index];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: scenario.message,
          tone: scenario.tone,
          speed: "fast",
          relationship: scenario.relationship,
          purpose: scenario.purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "답장 생성에 실패했습니다.");
        setPhase("select");
        return;
      }

      setReplies(data.replies);
      setPhase("result");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setPhase("select");
    }
  };

  const handleBack = () => {
    setPhase("select");
    setReplies([]);
    setSelectedIndex(null);
    setError("");
  };

  const scenario = selectedIndex !== null ? SCENARIOS[selectedIndex] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            {phase === "result" && (
              <button onClick={handleBack} className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer mr-1">
                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-bold text-white">
              {phase === "select" ? "바로 체험해 보세요" : phase === "loading" ? "답장 생성 중..." : "AI가 만든 답장"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 시나리오 선택 */}
          {phase === "select" && (
            <>
              <p className="text-sm text-slate-400 leading-relaxed">
                상황을 하나 골라보세요. AI가 실제로 답장을 만들어 드릴게요.
              </p>
              {error && (
                <p className="text-sm text-rose-400 bg-rose-950/30 border border-rose-800 rounded-xl px-4 py-3">{error}</p>
              )}
              <div className="space-y-3">
                {SCENARIOS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => handleSelect(i)}
                    className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-teal-600/50 hover:bg-slate-900/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <ScenarioIcon type={s.icon} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{s.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {TONE_LABELS[s.tone]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          &ldquo;{s.message}&rdquo;
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 로딩 */}
          {phase === "loading" && scenario && (
            <div className="py-12 flex flex-col items-center gap-5">
              <div className="w-10 h-10 border-2 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm text-slate-300 mb-1">&ldquo;{scenario.message.substring(0, 40)}...&rdquo;</p>
                <p className="text-xs text-slate-500">{TONE_LABELS[scenario.tone]} 톤으로 생성 중</p>
              </div>
            </div>
          )}

          {/* 결과 */}
          {phase === "result" && scenario && (
            <>
              {/* 원문 */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/40">
                <p className="text-xs text-slate-500 mb-1">받은 메시지</p>
                <p className="text-sm text-slate-300 leading-relaxed">{scenario.message}</p>
              </div>

              {/* 답장 3개 */}
              <div className="space-y-3">
                {replies.map((reply, i) => (
                  <div
                    key={i}
                    className={`p-4 bg-slate-900 border border-slate-800/60 border-l-2 ${TONE_COLORS[scenario.tone]} rounded-xl animate-fade-in-up`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <p className="text-xs font-semibold text-slate-400 mb-2">{reply.label}</p>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{reply.content}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2 space-y-3">
                <p className="text-center text-sm text-slate-400">
                  마음에 드셨나요? 직접 메시지를 넣어보세요.
                </p>
                <Link
                  href="/app"
                  className="block w-full py-3 text-center rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
                  onClick={onClose}
                >
                  지금 시작하기
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
