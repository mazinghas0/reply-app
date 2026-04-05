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
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">리플라이</h1>
        <p className="text-gray-500">
          받은 메시지를 붙여넣으면 AI가 답장 3개를 만들어 드립니다
        </p>
      </header>

      <section className="w-full space-y-4">
        <div>
          <label
            htmlFor="message-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            받은 메시지
          </label>
          <textarea
            id="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="답장하고 싶은 메시지를 여기에 붙여넣으세요..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Ctrl+Enter로 바로 생성
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            답장 톤 선택
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`px-3 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  selectedTone === tone.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div>{tone.label}</div>
                <div className="text-xs font-normal mt-0.5 opacity-70">
                  {tone.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!inputMessage.trim() || loading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? "AI가 답장을 준비하고 있어요..." : "답장 만들기"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </section>

      {replies.length > 0 && (
        <section className="w-full mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            답장 제안 ({replies.length}개)
          </h2>
          {replies.map((reply, index) => (
            <div
              key={index}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {reply.label}
                </span>
                <button
                  onClick={() => handleCopy(reply.content, index)}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {copiedIndex === index ? "복사됨!" : "복사"}
                </button>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </section>
      )}

      <footer className="mt-12 text-center text-xs text-gray-400">
        Kevin AI Corp
      </footer>
    </main>
  );
}
