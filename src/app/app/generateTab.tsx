"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ShareMenu from "./shareMenu";
import HistorySection from "./historySection";
import ContextSelector, {
  type ContextSelection,
  getRelationshipLabel,
  getPurposeLabel,
  getStrategyPrompt,
} from "./contextSelector";
import {
  type Reply,
  type HistoryEntry,
  type ToneId,
  type Speed,
  type StreakData,
  TONES,
  TONE_STYLES,
  TONE_COLORS,
  SPEEDS,
  HISTORY_KEY,
  loadHistory,
  saveToHistory,
} from "./shared";
import { IconCopy, IconCheck, IconError, IconSpinner } from "./icons";

interface GenerateTabProps {
  inputMessage: string;
  onInputChange: (v: string) => void;
  remaining: number | null;
  isAuthenticated: boolean;
  streak: StreakData;
  clipboardText: string | null;
  onClipboardUsed: () => void;
  onSuccess: () => void;
  onRemainingUpdate: (n: number) => void;
}

export default function GenerateTab({
  inputMessage,
  onInputChange,
  remaining,
  isAuthenticated,
  streak,
  clipboardText,
  onClipboardUsed,
  onSuccess,
  onRemainingUpdate,
}: GenerateTabProps) {
  const [selectedTone, setSelectedTone] = useState<ToneId>("polite");
  const [speed, setSpeed] = useState<Speed>("quality");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [intentHint, setIntentHint] = useState("");
  const [context, setContext] = useState<ContextSelection>({
    relationship: null,
    relationshipCustom: "",
    purpose: null,
    purposeCustom: "",
    strategy: null,
  });
  const [expandedReplyIndex, setExpandedReplyIndex] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, string[]>>({});
  const [expandLoading, setExpandLoading] = useState(false);
  const [editingReplyIndex, setEditingReplyIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    const savedTone = localStorage.getItem("reply-default-tone");
    if (savedTone && TONES.some((t) => t.id === savedTone)) setSelectedTone(savedTone as ToneId);
    const savedSpeed = localStorage.getItem("reply-default-speed");
    if (savedSpeed && SPEEDS.some((s) => s.id === savedSpeed)) setSpeed(savedSpeed as Speed);
  }, []);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    setError("");
    setShowLoginHint(false);
    setReplies([]);
    setExpandedReplyIndex(null);
    setExpandedReplies({});
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
          speed,
          hint: intentHint.trim() || undefined,
          relationship: context.relationship
            ? (context.relationship === "custom" ? context.relationshipCustom : getRelationshipLabel(context.relationship))
            : undefined,
          purpose: context.purpose
            ? (context.purpose === "custom" ? context.purposeCustom : getPurposeLabel(context.purpose))
            : undefined,
          strategy: context.strategy ? getStrategyPrompt(context.strategy) : undefined,
        }),
      });
      const data = await res.json();
      if (typeof data.remaining === "number") onRemainingUpdate(data.remaining);
      if (!res.ok) {
        if (res.status === 429 && data.isAuthenticated === false) {
          setShowLoginHint(true);
        }
        throw new Error(data.error || "답장 생성에 실패했습니다");
      }
      setReplies(data.replies);
      if (!isAuthenticated && !localStorage.getItem("reply-login-nudge-shown")) {
        setShowLoginNudge(true);
        localStorage.setItem("reply-login-nudge-shown", "1");
      }
      const entry: HistoryEntry = {
        id: String(Date.now()),
        inputMessage: inputMessage.trim(),
        tone: selectedTone,
        speed,
        replies: data.replies,
        createdAt: new Date().toISOString(),
      };
      setHistory(saveToHistory(entry));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (replyIndex: number, variant: "stronger" | "softer" | "shorter") => {
    const original = replies[replyIndex]?.content;
    if (!original) return;
    setExpandLoading(true);
    setExpandedReplyIndex(replyIndex);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
          speed,
          expand: { original, variant },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "확장 실패");
      const texts = (data.replies as Reply[]).map((r: Reply) => r.content);
      setExpandedReplies((prev) => ({ ...prev, [replyIndex]: texts }));
    } catch {
      // 에러 시 무시
    } finally {
      setExpandLoading(false);
      setExpandedReplyIndex(null);
    }
  };

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEditCopy = async (originalContent: string, index: number) => {
    const edited = editText.trim();
    if (!edited) return;
    await navigator.clipboard.writeText(edited);
    setCopiedKey(`edit-${index}`);
    setTimeout(() => setCopiedKey(null), 2000);
    setEditingReplyIndex(null);
    setEditText("");
    if (isAuthenticated && edited !== originalContent.trim()) {
      const rel = context.relationship === "custom"
        ? context.relationshipCustom
        : context.relationship;
      fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: originalContent,
          edited,
          tone: selectedTone,
          relationship: rel ?? undefined,
        }),
      }).catch(() => {});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <>
      {/* 클립보드 감지 배너 */}
      {clipboardText && (
        <div className="w-full mb-4 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">클립보드에서 메시지를 발견했어요</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 truncate mt-0.5">{clipboardText.substring(0, 50)}{clipboardText.length > 50 ? "..." : ""}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { onInputChange(clipboardText); onClipboardUsed(); }}
              className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
              붙여넣기
            </button>
            <button
              onClick={onClipboardUsed}
              className="px-2 py-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <section className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 transition-colors duration-200">
        {/* Usage badge */}
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

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="message-input" className="text-sm font-semibold text-slate-800 dark:text-slate-200">받은 메시지</label>
            <span className={`text-xs tabular-nums ${inputMessage.length > 1800 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
              {inputMessage.length} / 2,000
            </span>
          </div>
          <textarea
            data-tour="tour-message-input"
            id="message-input"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답장하고 싶은 메시지를 여기에 붙여넣으세요..."
            maxLength={2000}
            className="w-full h-36 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
            <span className="ml-0.5">로 바로 생성</span>
          </p>
        </div>

        {/* Context Selector (3-step) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">맞춤 설정 <span className="font-normal text-slate-400 dark:text-slate-500">(선택 — 더 정확한 답장)</span></label>
          <div data-tour="tour-context-selector">
            <ContextSelector value={context} onChange={setContext} />
          </div>
        </div>

        {/* Tone Selector (classic) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">답장 톤</label>
          <div data-tour="tour-tone-selector" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map((tone) => {
              const isSelected = selectedTone === tone.id;
              const styles = TONE_STYLES[tone.id];
              return (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? styles.selected
                      : `border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${styles.hover}`
                  }`}
                >
                  <div className="font-semibold">{tone.label}</div>
                  <div className={`text-xs font-normal mt-0.5 ${isSelected ? "opacity-80" : "opacity-60"}`}>{tone.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intent Hint */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            원하는 방향 <span className="font-normal text-slate-400 dark:text-slate-500">(선택)</span>
          </label>
          <input
            type="text"
            value={intentHint}
            onChange={(e) => setIntentHint(e.target.value)}
            placeholder="예: 정중하게 거절, 조건부 수락, 감사 표현, 시간 달라고..."
            maxLength={100}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        {/* Speed Toggle */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">답장 품질</label>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900">
            {SPEEDS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSpeed(s.id)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  speed === s.id
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <div>{s.label}</div>
                <div className="text-xs font-normal mt-0.5 opacity-60">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          data-tour="tour-generate-button"
          onClick={handleGenerate}
          disabled={!inputMessage.trim() || loading}
          className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-500 hover:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <IconSpinner />
              AI가 답장을 준비하고 있어요
            </span>
          ) : (
            "답장 만들기"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-sm">
            <div className="flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
              <IconError />
              {error}
            </div>
            {showLoginHint && (
              <Link
                href="/sign-in"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                로그인하고 10회 사용하기
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      {replies.length > 0 && (
        <section className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">답장 제안</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
          </div>
          {replies.map((reply, index) => (
            <div
              key={index}
              className={`animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-2 ${TONE_COLORS[selectedTone]} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{reply.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {editingReplyIndex === index ? (
                    <>
                      <button
                        onClick={() => handleEditCopy(reply.content, index)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                          copiedKey === `edit-${index}`
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                            : "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40"
                        }`}
                      >
                        {copiedKey === `edit-${index}` ? <><IconCheck /> 저장됨</> : <><IconCopy /> 수정 복사</>}
                      </button>
                      <button
                        onClick={() => { setEditingReplyIndex(null); setEditText(""); }}
                        className="text-xs px-2 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopy(reply.content, `reply-${index}`)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                          copiedKey === `reply-${index}`
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        {copiedKey === `reply-${index}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                      </button>
                      <button
                        onClick={() => { setEditingReplyIndex(index); setEditText(reply.content); }}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
                      >
                        수정 후 복사
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingReplyIndex === index ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  className="w-full text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">{reply.content}</p>
              )}

              {/* Expand + Share buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {(["stronger", "softer", "shorter"] as const).map((variant) => {
                  const labels = { stronger: "더 강하게", softer: "더 부드럽게", shorter: "더 짧게" };
                  return (
                    <button
                      key={variant}
                      onClick={() => handleExpand(index, variant)}
                      disabled={expandLoading && expandedReplyIndex === index}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {expandLoading && expandedReplyIndex === index ? "..." : labels[variant]}
                    </button>
                  );
                })}
                <div className="flex-1" />
                <ShareMenu content={reply.content} index={index} />
              </div>

              {/* Expanded replies */}
              {expandedReplies[index] && (
                <div className="mt-3 space-y-2">
                  {expandedReplies[index].map((expanded, ei) => (
                    <div key={ei} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                          {["더 강하게", "더 부드럽게", "더 짧게"][ei]}
                        </span>
                        <button
                          onClick={() => handleCopy(expanded, `expand-${index}-${ei}`)}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                            copiedKey === `expand-${index}-${ei}`
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {copiedKey === `expand-${index}-${ei}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{expanded}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 로그인 유도 (비로그인 첫 생성 후) */}
      {showLoginNudge && (
        <div className="w-full mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-fade-in-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">이 답장을 저장하고 싶으세요?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                로그인하면 히스토리에 자동 저장되고, 매달 50크레딧을 무료로 받아요.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 mt-2.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
              >
                무료로 로그인하기
              </Link>
            </div>
            <button onClick={() => setShowLoginNudge(false)} className="shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <HistorySection
        history={history}
        streak={streak}
        copiedKey={copiedKey}
        onCopy={handleCopy}
        onClearHistory={handleClearHistory}
      />
    </>
  );
}
