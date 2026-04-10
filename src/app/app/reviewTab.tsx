"use client";

import { useState } from "react";
import { type ReviewResult } from "./shared";
import { IconSpinner, IconError } from "./icons";

interface ReviewTabProps {
  initialDraft?: string;
  initialCredits?: number | null;
  onSuccess: () => void;
  maxInputLength: number;
  isAuthenticated: boolean;
}

export default function ReviewTab({ initialDraft = "", initialCredits = null, onSuccess, maxInputLength, isAuthenticated }: ReviewTabProps) {
  const [reviewDraft, setReviewDraft] = useState(initialDraft);
  const [reviewContext, setReviewContext] = useState("");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(initialCredits);

  const handleReview = async () => {
    if (!reviewDraft.trim()) return;
    setReviewLoading(true);
    setReviewError("");
    setReviewResult(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: reviewDraft.trim(),
          context: reviewContext.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "검토에 실패했습니다");
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      setReviewResult(data.review);
      onSuccess();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <>
      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 transition-colors duration-200">
        {remaining !== null && (
          <div className="flex justify-end">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              remaining <= 5
                ? "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900"
                : "bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
            }`}>
              {remaining} 크레딧 남음
            </span>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">내가 쓴 답장</label>
            <span className={`text-xs tabular-nums ${reviewDraft.length > maxInputLength * 0.9 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
              {reviewDraft.length} / {maxInputLength}
            </span>
          </div>
          <textarea
            value={reviewDraft}
            onChange={(e) => setReviewDraft(e.target.value)}
            placeholder="검토받고 싶은 답장을 붙여넣으세요..."
            maxLength={maxInputLength}
            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          {!isAuthenticated && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
              체험판은 {maxInputLength}자 제한
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            받은 메시지 <span className="font-normal text-slate-400 dark:text-slate-500">(선택)</span>
          </label>
          <textarea
            value={reviewContext}
            onChange={(e) => setReviewContext(e.target.value)}
            placeholder="어떤 메시지에 대한 답장인지 붙여넣으면 더 정확한 검토가 가능해요"
            maxLength={500}
            className="w-full h-20 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>
        <button
          onClick={handleReview}
          disabled={!reviewDraft.trim() || reviewLoading}
          className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-500 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {reviewLoading ? <span className="inline-flex items-center gap-2"><IconSpinner />AI가 검토하고 있어요</span> : "답장 검토하기"}
        </button>
        {reviewError && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
            <IconError />{reviewError}
          </div>
        )}
      </section>

      {reviewResult && (
        <section className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">검토 결과</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
          </div>

          {/* Scores */}
          {reviewResult.scores && (
            <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">종합 점수</h3>
              <div className="space-y-3">
                {([
                  { key: "politeness" as const, label: "공손함", color: "bg-teal-500", desc: "높을수록 공손" },
                  { key: "clarity" as const, label: "명확성", color: "bg-blue-500", desc: "높을수록 명확" },
                  { key: "pressure" as const, label: "부담도", color: "bg-amber-500", desc: "높을수록 부담" },
                  { key: "misunderstanding" as const, label: "오해 가능성", color: "bg-rose-500", desc: "높을수록 위험" },
                ]).map((item) => {
                  const value = reviewResult.scores![item.key];
                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{value}/10 — {item.desc}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${value * 10}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warnings */}
          {reviewResult.warnings && reviewResult.warnings.length > 0 && (
            <div className="animate-fade-in-up p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl shadow-sm" style={{ animationDelay: "50ms" }}>
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                주의할 표현
              </h3>
              <ul className="space-y-1.5">
                {reviewResult.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tone */}
          <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">톤 분석</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className={`w-8 h-2.5 rounded-full ${n <= reviewResult.tone.score ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{reviewResult.tone.label}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{reviewResult.tone.detail}</p>
          </div>

          {/* Impression */}
          <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "150ms" }}>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">상대방은 이렇게 느껴요</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{reviewResult.impression}</p>
          </div>

          {/* Spelling */}
          {reviewResult.spelling.length > 0 && (
            <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "250ms" }}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">맞춤법 ({reviewResult.spelling.length}건)</h3>
              <div className="space-y-2">
                {reviewResult.spelling.map((s, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-sm">
                    <span className="line-through text-rose-400">{s.original}</span>
                    <span className="text-slate-400 dark:text-slate-500">&rarr;</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{s.corrected}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">({s.reason})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {reviewResult.suggestions.length > 0 && (
            <div className="animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm" style={{ animationDelay: "350ms" }}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">개선 제안 ({reviewResult.suggestions.length}건)</h3>
              <div className="space-y-3">
                {reviewResult.suggestions.map((s, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-baseline gap-2 text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{s.original}</span>
                      <span className="text-slate-400 dark:text-slate-500">&rarr;</span>
                      <span className="text-teal-600 dark:text-teal-400 font-medium">{s.improved}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
