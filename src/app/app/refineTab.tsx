"use client";

import { useState, useEffect } from "react";
import ContextSelector, {
  type ContextSelection,
  getRelationshipLabel,
  getPurposeLabel,
  getStrategyPrompt,
} from "./contextSelector";
import {
  type Reply,
  type ToneId,
  type HistoryEntry,
  type StreakData,
  TONES,
  TONE_STYLES,
  TONE_COLORS,
  HISTORY_KEY_REFINE,
  loadHistory,
  saveToHistory,
} from "./shared";
import ShareMenu from "./shareMenu";
import HistorySection from "./historySection";
import { IconCopy, IconCheck } from "./icons";

// ─── Example Tags ───────────────────────────────

const EXAMPLE_TAGS = [
  "회의 참석 어렵다고",
  "마감 연장 부탁",
  "고마워요 전해주세요",
  "다음에 같이 밥",
  "이번 건 어려울 것 같아",
  "축하한다고 전해",
];

// ─── Icons ──────────────────────────────────────

function IconSpinner() {
  return (
    <svg className="w-5 h-5" style={{ animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconError() {
  return (
    <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── Component ──────────────────────────────────

interface RefineTabProps {
  initialText?: string;
  initialCredits?: number | null;
  onSuccess?: () => void;
  maxInputLength: number;
  isAuthenticated: boolean;
}

export default function RefineTab({
  initialText = "",
  initialCredits = null,
  onSuccess,
  maxInputLength,
  isAuthenticated,
}: RefineTabProps) {
  const [intent, setIntent] = useState(initialText);
  const [tone, setTone] = useState<ToneId>("polite");
  const [context, setContext] = useState<ContextSelection>({
    relationship: null,
    relationshipCustom: "",
    purpose: null,
    purposeCustom: "",
    strategy: null,
  });
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(initialCredits);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const emptyStreak: StreakData = { lastDate: "", count: 0 };

  useEffect(() => {
    setHistory(loadHistory(HISTORY_KEY_REFINE));
  }, []);

  useEffect(() => {
    if (initialText && initialText.trim()) {
      setIntent(initialText);
    }
  }, [initialText]);

  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY_REFINE);
    setHistory([]);
  };

  const handleGenerate = async () => {
    if (!intent.trim()) return;

    setLoading(true);
    setError("");
    setReplies([]);

    const payload: Record<string, string> = { intent, tone };
    if (context.relationship) {
      payload.relationship = context.relationship === "custom"
        ? context.relationshipCustom
        : getRelationshipLabel(context.relationship);
    }
    if (context.purpose) {
      payload.purpose = context.purpose === "custom"
        ? context.purposeCustom
        : getPurposeLabel(context.purpose);
    }
    if (context.strategy) {
      payload.strategy = getStrategyPrompt(context.strategy);
    }

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      if (typeof data.remaining === "number") setRemaining(data.remaining);
      const newReplies = data.replies as Reply[];
      setReplies(newReplies);
      const entry: HistoryEntry = {
        id: String(Date.now()),
        inputMessage: intent.trim(),
        tone,
        speed: "quality",
        replies: newReplies,
        createdAt: new Date().toISOString(),
      };
      setHistory(saveToHistory(entry, HISTORY_KEY_REFINE));
      onSuccess?.();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTagClick = (tag: string) => {
    setIntent((prev) => {
      const trimmed = prev.trim();
      if (trimmed) return `${trimmed} ${tag}`;
      return tag;
    });
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

        {/* Intent Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            하고 싶은 말
          </label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && intent.trim() && !loading) {
                handleGenerate();
              }
            }}
            placeholder="키워드, 메모, 대충 적은 문장 — 뭐든 괜찮아요. AI가 완성된 메시지로 만들어 드려요."
            maxLength={maxInputLength}
            className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          <div className="flex justify-between mt-1">
            {!isAuthenticated && (
              <span className="text-xs text-amber-500 dark:text-amber-400">체험판은 {maxInputLength}자 제한</span>
            )}
            <span className={`text-xs tabular-nums ml-auto ${intent.length > maxInputLength * 0.9 ? "text-rose-400" : "text-slate-300 dark:text-slate-600"}`}>
              {intent.length}/{maxInputLength}
            </span>
          </div>
        </div>

        {/* Example Tags */}
        {!intent.trim() && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Context Selector */}
        <div data-tour="tour-refine-context">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
            상황 선택 <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(선택사항)</span>
          </label>
          <ContextSelector value={context} onChange={setContext} />
        </div>

        {/* Tone Selector */}
        <div data-tour="tour-refine-tone">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
            톤 선택
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((t) => {
              const isSelected = tone === t.id;
              const style = TONE_STYLES[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? style.selected
                      : `border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${style.hover}`
                  }`}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className={`block text-xs mt-0.5 ${isSelected ? "opacity-80" : "text-slate-400 dark:text-slate-500"}`}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={!intent.trim() || loading}
          className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-500 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <IconSpinner />
              AI가 메시지를 만들고 있어요
            </span>
          ) : (
            "메시지 만들기"
          )}
        </button>

        {/* Shortcut hint */}
        {intent.trim() && !loading && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Ctrl + Enter로 바로 실행
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
            <IconError />
            {error}
          </div>
        )}
      </section>

      {/* Results — 3 Reply Cards */}
      {replies.length > 0 && (
        <section className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">완성된 메시지</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
          </div>

          {replies.map((reply, index) => (
            <div
              key={index}
              className={`animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-2 ${TONE_COLORS[tone]} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{reply.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(reply.content, `refine-${index}`)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      copiedKey === `refine-${index}`
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {copiedKey === `refine-${index}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                  </button>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">{reply.content}</p>

              {/* Share button */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex-1" />
                <ShareMenu content={reply.content} index={index} />
              </div>
            </div>
          ))}
        </section>
      )}

      <HistorySection
        history={history}
        streak={emptyStreak}
        copiedKey={copiedKey}
        onCopy={handleCopy}
        onClearHistory={handleClearHistory}
      />
    </>
  );
}
