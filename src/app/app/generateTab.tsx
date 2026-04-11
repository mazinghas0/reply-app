"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  SPEEDS,
  HISTORY_KEY_GENERATE,
  loadHistory,
  saveToHistory,
  saveLastDraft,
} from "./shared";
import { IconError, IconSpinner } from "./icons";
import PresetPanel from "./presetPanel";
import ReplyCardSection from "./replyCard";
import type { RelationshipId, PurposeId, StrategyId } from "./contextSelector";
import type { QuickPick } from "./quickActions";

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
  maxInputLength: number;
  allowSonnet: boolean;
  quickPick?: QuickPick | null;
  onQuickPickConsumed?: () => void;
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
  maxInputLength,
  allowSonnet,
  quickPick,
  onQuickPickConsumed,
}: GenerateTabProps) {
  const [selectedTone, setSelectedTone] = useState<ToneId>("polite");
  const [speed, setSpeed] = useState<Speed>("quality");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [intentHint, setIntentHint] = useState("");
  const [context, setContext] = useState<ContextSelection>({
    relationship: null,
    relationshipCustom: "",
    purpose: null,
    purposeCustom: "",
    strategy: null,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [detectRemaining, setDetectRemaining] = useState<number | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    const savedTone = localStorage.getItem("reply-default-tone");
    if (savedTone && TONES.some((t) => t.id === savedTone)) setSelectedTone(savedTone as ToneId);
    const savedSpeed = localStorage.getItem("reply-default-speed");
    if (savedSpeed && SPEEDS.some((s) => s.id === savedSpeed)) setSpeed(savedSpeed as Speed);
  }, []);

  useEffect(() => {
    if (!quickPick) return;
    if (quickPick.type === "draft" && quickPick.draft) {
      const d = quickPick.draft;
      onInputChange(d.inputMessage);
      setContext({
        relationship: (d.relationship as RelationshipId | null) ?? null,
        relationshipCustom: "",
        purpose: (d.purpose as PurposeId | null) ?? null,
        purposeCustom: "",
        strategy: null,
      });
      if (TONES.some((t) => t.id === d.tone)) setSelectedTone(d.tone);
    } else if (quickPick.type === "relationship" && quickPick.relationship) {
      setContext((prev) => ({
        ...prev,
        relationship: quickPick.relationship!,
        relationshipCustom: "",
      }));
    } else if (quickPick.type === "purpose" && quickPick.purpose) {
      setContext((prev) => ({
        ...prev,
        purpose: quickPick.purpose!,
        purposeCustom: "",
      }));
    }
    onQuickPickConsumed?.();
  }, [quickPick, onInputChange, onQuickPickConsumed]);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    setError("");
    setShowLoginHint(false);
    setReplies([]);
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
      saveLastDraft({
        inputMessage: inputMessage.trim(),
        relationship: context.relationship,
        purpose: context.purpose,
        tone: selectedTone,
        savedAt: new Date().toISOString(),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectContext = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || detecting) return;
    setDetecting(true);
    setDetectError("");
    try {
      const res = await fetch("/api/detect-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "상황 감지에 실패했어요");
      }
      setContext({
        relationship: data.relationship as RelationshipId,
        relationshipCustom: "",
        purpose: data.purpose as PurposeId,
        purposeCustom: "",
        strategy: null,
      });
      if (typeof data.remaining === "number") setDetectRemaining(data.remaining);
    } catch (err) {
      setDetectError(err instanceof Error ? err.message : "오류가 발생했어요");
    } finally {
      setDetecting(false);
    }
  };

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY_GENERATE);
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
            <span className={`text-xs tabular-nums ${inputMessage.length > maxInputLength * 0.9 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}>
              {inputMessage.length} / {maxInputLength}
            </span>
          </div>
          <textarea
            data-tour="tour-message-input"
            id="message-input"
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답장하고 싶은 메시지를 여기에 붙여넣으세요..."
            maxLength={maxInputLength}
            className="w-full h-36 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          {!isAuthenticated && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
              체험판은 {maxInputLength}자 제한 &middot; <Link href="/sign-in" className="underline font-medium">로그인하면 500자까지</Link>
            </p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd>
            <span className="ml-0.5">로 바로 생성</span>
          </p>
        </div>

        {/* Preset */}
        <PresetPanel
          isAuthenticated={isAuthenticated}
          currentSettings={{
            tone: selectedTone,
            speed,
            relationship: context.relationship,
            relationshipCustom: context.relationshipCustom,
            purpose: context.purpose,
            purposeCustom: context.purposeCustom,
            strategy: context.strategy,
          }}
          onLoadPreset={(settings) => {
            setSelectedTone(settings.tone as ToneId);
            setSpeed(settings.speed as Speed);
            setContext({
              relationship: settings.relationship as RelationshipId | null,
              relationshipCustom: settings.relationshipCustom,
              purpose: settings.purpose as PurposeId | null,
              purposeCustom: settings.purposeCustom,
              strategy: settings.strategy as StrategyId | null,
            });
          }}
        />

        {/* Context Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">상황 선택 <span className="font-normal text-slate-400 dark:text-slate-500">(선택 — 더 정확한 답장)</span></label>
          <div data-tour="tour-context-selector">
            <ContextSelector
              value={context}
              onChange={setContext}
              inputMessage={inputMessage}
              onDetectContext={handleDetectContext}
              detecting={detecting}
              detectError={detectError}
              detectRemaining={detectRemaining}
              isAuthenticated={isAuthenticated}
            />
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
            {SPEEDS.map((s) => {
              const locked = s.id === "quality" && !allowSonnet;
              return (
                <button
                  key={s.id}
                  onClick={() => { if (!locked) setSpeed(s.id); }}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
                    speed === s.id && !locked
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <div>{s.label}{locked ? " (Pro)" : ""}</div>
                  <div className="text-xs font-normal mt-0.5 opacity-60">{locked ? "Pro 플랜 이상" : s.desc}</div>
                </button>
              );
            })}
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
                로그인하고 10크레딧 받기
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      <ReplyCardSection
        replies={replies}
        tone={selectedTone}
        speed={speed}
        inputMessage={inputMessage}
        isAuthenticated={isAuthenticated}
        relationship={context.relationship}
        relationshipCustom={context.relationshipCustom}
      />

      {/* 로그인 유도 (비로그인 첫 생성 후) */}
      {showLoginNudge && (
        <div className="w-full mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-fade-in-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">이 답장을 저장하고 싶으세요?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                로그인하면 히스토리에 자동 저장되고, 매달 10크레딧을 무료로 받아요.
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
