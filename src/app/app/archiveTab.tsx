"use client";

import { useEffect, useState } from "react";
import QuickActions, { type QuickPick } from "./quickActions";
import { loadQuickActions } from "./shared";

interface ArchiveTabProps {
  onPick: (pick: QuickPick) => void;
}

export default function ArchiveTab({ onPick }: ArchiveTabProps) {
  const [isEmpty, setIsEmpty] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = loadQuickActions();
    const hasDraft =
      data.lastDraft !== null && data.lastDraft.inputMessage.trim().length > 0;
    const hasRecent =
      data.recentRelationships.length > 0 || data.recentPurposes.length > 0;
    setIsEmpty(!hasDraft && !hasRecent);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="w-full">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          기록
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          최근에 고른 관계·상황과 마지막으로 쓰던 초안을 한 자리에서 이어갈 수 있어요.
        </p>
      </div>

      {isEmpty ? (
        <div className="w-full py-12 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-teal-500 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            아직 기록이 없어요
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs">
            답장 만들기 탭에서 한 번 써 보면 최근에 고른 관계·상황과 마지막 초안이 여기에 쌓여요.
          </p>
        </div>
      ) : (
        <QuickActions onPick={onPick} />
      )}
    </section>
  );
}
