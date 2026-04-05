"use client";

import { useState } from "react";

interface Reply {
  label: string;
  content: string;
}

const TONES = [
  { id: "polite", label: "정중한", desc: "예의 바르고 격식 있는" },
  { id: "firm", label: "단호한", desc: "명확하고 프로페셔널한" },
  { id: "flexible", label: "유연한", desc: "열린 자세, 협상 가능한" },
  { id: "friendly", label: "친근한", desc: "편하고 가벼운" },
] as const;

type ToneId = (typeof TONES)[number]["id"];

const TONE_STYLES: Record<
  ToneId,
  { selected: string; hover: string }
> = {
  polite: {
    selected:
      "border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200",
    hover: "hover:border-indigo-200 hover:bg-indigo-50/50",
  },
  firm: {
    selected:
      "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200",
    hover: "hover:border-rose-200 hover:bg-rose-50/50",
  },
  flexible: {
    selected:
      "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  friendly: {
    selected:
      "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200",
    hover: "hover:border-amber-200 hover:bg-amber-50/50",
  },
};

function IconChat() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconError() {
  return (
    <svg
      className="w-5 h-5 shrink-0 mt-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg
      className="w-5 h-5"
      style={{ animation: "spin 1s linear infinite" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="32"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneId>("polite");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);
    setError("");
    setReplies([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone: selectedTone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "답장 생성에 실패했습니다");
      }

      const data = await res.json();
      setReplies(data.replies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10 sm:py-16 max-w-xl mx-auto w-full">
      {/* Hero */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <IconChat />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            리플라이
          </h1>
        </div>
        <p className="text-gray-500 text-sm sm:text-base">
          받은 메시지를 붙여넣으면, AI가 답장 3개를 만들어 드려요
        </p>
      </header>

      {/* Input Card */}
      <section className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-5">
        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="message-input"
              className="text-sm font-semibold text-gray-800"
            >
              받은 메시지
            </label>
            <span
              className={`text-xs tabular-nums ${
                inputMessage.length > 1800
                  ? "text-rose-500"
                  : "text-gray-400"
              }`}
            >
              {inputMessage.length} / 2,000
            </span>
          </div>
          <textarea
            id="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답장하고 싶은 메시지를 여기에 붙여넣으세요..."
            maxLength={2000}
            className="w-full h-36 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none text-gray-900 placeholder-gray-400 text-sm leading-relaxed transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
              Enter
            </kbd>
            <span className="ml-0.5">로 바로 생성</span>
          </p>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2.5">
            답장 톤
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                      : `border-gray-200 bg-white text-gray-600 ${styles.hover}`
                  }`}
                >
                  <div className="font-semibold">{tone.label}</div>
                  <div
                    className={`text-xs font-normal mt-0.5 ${
                      isSelected ? "opacity-80" : "opacity-60"
                    }`}
                  >
                    {tone.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!inputMessage.trim() || loading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
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
          <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            <IconError />
            {error}
          </div>
        )}
      </section>

      {/* Results */}
      {replies.length > 0 && (
        <section className="w-full mt-8 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
            <h2 className="text-sm font-semibold text-gray-500 tracking-wider">
              답장 제안
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
          </div>
          {replies.map((reply, index) => (
            <div
              key={index}
              className="animate-fade-in-up p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {reply.label}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(reply.content, index)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                    copiedIndex === index
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {copiedIndex === index ? (
                    <>
                      <IconCheck />
                      복사됨
                    </>
                  ) : (
                    <>
                      <IconCopy />
                      복사
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                {reply.content}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 mb-4 text-center">
        <p className="text-xs text-gray-400">Kevin AI Corp</p>
      </footer>
    </main>
  );
}
