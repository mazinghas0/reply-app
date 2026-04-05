"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────

type RefineToneId = "natural" | "polite" | "firm" | "flexible" | "friendly";

// ─── Constants ───────────────────────────────────

const REFINE_TONES = [
  { id: "natural", label: "자연스럽게", desc: "톤 유지, 문장만 다듬기" },
  { id: "polite", label: "정중한", desc: "예의 바르고 격식 있는" },
  { id: "firm", label: "단호한", desc: "명확하고 프로페셔널한" },
  { id: "flexible", label: "유연한", desc: "열린 자세, 협상 가능한" },
  { id: "friendly", label: "친근한", desc: "편하고 가벼운" },
] as const;

const REFINE_TONE_STYLES: Record<RefineToneId, { selected: string; hover: string }> = {
  natural: {
    selected: "border-sky-400 bg-sky-50 text-sky-700 ring-2 ring-sky-200",
    hover: "hover:border-sky-200 hover:bg-sky-50/50",
  },
  polite: {
    selected: "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200",
    hover: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  firm: {
    selected: "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200",
    hover: "hover:border-rose-200 hover:bg-rose-50/50",
  },
  flexible: {
    selected: "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  friendly: {
    selected: "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200",
    hover: "hover:border-amber-200 hover:bg-amber-50/50",
  },
};

// ─── Icons ───────────────────────────────────────

function IconCopy() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────

export default function RefineTab() {
  const [draft, setDraft] = useState("");
  const [tone, setTone] = useState<RefineToneId>("natural");
  const [refined, setRefined] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalSnapshot, setOriginalSnapshot] = useState("");

  const handleRefine = async () => {
    if (!draft.trim()) return;

    setLoading(true);
    setError("");
    setRefined(null);
    setOriginalSnapshot(draft);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      setRefined(data.refined);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!refined) return;
    await navigator.clipboard.writeText(refined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <section className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Draft Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            다듬을 답장
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && draft.trim() && !loading) {
                handleRefine();
              }
            }}
            placeholder="대충 쓴 답장을 붙여넣으세요. AI가 깔끔하게 다듬어 드려요..."
            maxLength={2000}
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none text-slate-900 placeholder-slate-400 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs tabular-nums ${draft.length > 1800 ? "text-rose-400" : "text-slate-300"}`}>
              {draft.length}/2000
            </span>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2.5">
            어떤 느낌으로 다듬을까요?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REFINE_TONES.map((t) => {
              const isSelected = tone === t.id;
              const style = REFINE_TONE_STYLES[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? style.selected
                      : `border-slate-200 bg-white text-slate-600 ${style.hover}`
                  }`}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className={`block text-xs mt-0.5 ${isSelected ? "opacity-80" : "text-slate-400"}`}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleRefine}
          disabled={!draft.trim() || loading}
          className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl shadow-sm hover:bg-teal-700 hover:shadow-md disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <IconSpinner />
              AI가 다듬고 있어요
            </span>
          ) : (
            "답장 다듬기"
          )}
        </button>

        {/* Shortcut hint */}
        {draft.trim() && !loading && (
          <p className="text-center text-xs text-slate-400">
            Ctrl + Enter로 바로 실행
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            <IconError />
            {error}
          </div>
        )}
      </section>

      {/* Result */}
      {refined && (
        <section className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
            <h2 className="text-sm font-semibold text-slate-500 tracking-wider">다듬어진 답장</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
          </div>

          {/* Refined Text */}
          <div className="animate-fade-in-up p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-700">
                {REFINE_TONES.find((t) => t.id === tone)?.label} 버전
              </span>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  copied
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {copied ? (
                  <><IconCheck /> 복사됨</>
                ) : (
                  <><IconCopy /> 복사</>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {refined}
            </p>
          </div>

          {/* Original Text (Collapsible) */}
          <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-1"
            >
              <IconChevron open={showOriginal} />
              원문 보기
            </button>
            {showOriginal && (
              <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {originalSnapshot}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
