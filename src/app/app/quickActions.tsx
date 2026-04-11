"use client";

import { useEffect, useState } from "react";
import {
  type LastDraft,
  loadQuickActions,
} from "./shared";

export interface QuickPick {
  type: "draft";
  draft: LastDraft;
}

interface QuickActionsProps {
  onPick: (pick: QuickPick) => void;
}

export default function QuickActions({ onPick }: QuickActionsProps) {
  const [lastDraft, setLastDraft] = useState<LastDraft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLastDraft(loadQuickActions().lastDraft);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasDraft = lastDraft !== null && lastDraft.inputMessage.trim().length > 0;

  if (!hasDraft) return null;

  const cardBase =
    "shrink-0 w-64 sm:w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-colors";

  return (
    <section
      data-tour="tour-quick-actions"
      className="w-full mb-5"
      aria-label="퀵액션 홈"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          빠른 시작
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          이어서 작성하기
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {hasDraft && lastDraft && (
          <button
            onClick={() => onPick({ type: "draft", draft: lastDraft })}
            className={`${cardBase} snap-start text-left hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer`}
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              마지막 초안 이어가기
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {lastDraft.inputMessage.length > 80
                ? `${lastDraft.inputMessage.slice(0, 80)}…`
                : lastDraft.inputMessage}
            </p>
            {(lastDraft.relationship || lastDraft.purpose) && (
              <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-2 font-medium">
                {[lastDraft.relationship, lastDraft.purpose].filter(Boolean).join(" · ")}
              </p>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
