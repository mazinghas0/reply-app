"use client";

import { useState, useEffect } from "react";
import {
  type HistoryEntry,
  type StreakData,
  TONES,
  SPEED_LABELS,
  formatTime,
  loadFavorites,
  toggleFavorite,
} from "./shared";
import { IconClock, IconChevron, IconCopy, IconCheck, IconTrash, IconStar, IconSearch } from "./icons";

interface HistorySectionProps {
  history: HistoryEntry[];
  streak: StreakData;
  copiedKey: string | null;
  onCopy: (content: string, key: string) => void;
  onClearHistory: () => void;
}

export default function HistorySection({ history, streak, copiedKey, onCopy, onClearHistory }: HistorySectionProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavorites(toggleFavorite(id));
  };

  const filtered = history.filter((entry) => {
    if (showOnlyFavorites && !favorites.has(entry.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        entry.inputMessage.toLowerCase().includes(q) ||
        entry.replies.some((r) => r.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (history.length === 0) return null;

  return (
    <section className="w-full mt-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <IconClock />
          최근 기록 ({history.length})
          <IconChevron open={showHistory} />
        </button>
        {streak.count > 0 && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 dark:text-amber-400">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2 5h-1.5L10 11 6 7h2L6 3z" /></svg>
            {streak.count}일
          </span>
        )}
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {showHistory && (
        <div className="space-y-2">
          {/* 검색 + 즐겨찾기 필터 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <IconSearch />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기록 검색..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`shrink-0 p-2 rounded-lg border transition-all cursor-pointer ${
                showOnlyFavorites
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-500"
                  : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-800"
              }`}
              title="즐겨찾기만 보기"
            >
              <IconStar filled={showOnlyFavorites} />
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
              {showOnlyFavorites ? "즐겨찾기가 없어요" : "검색 결과가 없어요"}
            </p>
          ) : (
            filtered.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isFav = favorites.has(entry.id);
              const toneLabel = TONES.find((t) => t.id === entry.tone)?.label ?? entry.tone;
              return (
                <div key={entry.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="flex-1 min-w-0 px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{entry.inputMessage}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {toneLabel} · {SPEED_LABELS[entry.speed]} · {formatTime(entry.createdAt)}
                        </p>
                      </div>
                      <IconChevron open={isExpanded} />
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(entry.id)}
                      className={`shrink-0 p-2 mr-2 rounded-lg transition-colors cursor-pointer ${
                        isFav ? "text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                      }`}
                      title={isFav ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                      <IconStar filled={isFav} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2 border-t border-slate-50 dark:border-slate-800">
                      {entry.replies.map((reply, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mt-2">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reply.label}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); onCopy(reply.content, `history-${entry.id}-${i}`); }}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                                copiedKey === `history-${entry.id}-${i}`
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              {copiedKey === `history-${entry.id}-${i}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 mx-auto mt-2 text-xs text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <IconTrash />
            기록 모두 삭제
          </button>
        </div>
      )}
    </section>
  );
}
