"use client";

import { NEWS, type NewsItem } from "./newsData";

interface NewsPageProps {
  onClose: () => void;
}

function VersionBadge({ version }: { version: string }) {
  return (
    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-md">
      {version}
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <VersionBadge version={item.version} />
        <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
      <div className="space-y-2">
        {item.items.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
          >
            <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewsPage({ onClose }: NewsPageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">새 소식</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content — Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {NEWS.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-500 transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
