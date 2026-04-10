"use client";

import { useEffect, useState } from "react";
import {
  type QuickActionsData,
  type LastDraft,
  loadQuickActions,
} from "./shared";
import {
  type RelationshipId,
  type PurposeId,
  getRelationshipLabel,
  getPurposeLabel,
} from "./contextSelector";

export interface QuickPick {
  type: "relationship" | "purpose" | "draft";
  relationship?: RelationshipId;
  purpose?: PurposeId;
  draft?: LastDraft;
}

interface QuickActionsProps {
  onPick: (pick: QuickPick) => void;
}

export default function QuickActions({ onPick }: QuickActionsProps) {
  const [data, setData] = useState<QuickActionsData>({
    recentRelationships: [],
    recentPurposes: [],
    lastDraft: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setData(loadQuickActions());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasRelationships = data.recentRelationships.length > 0;
  const hasPurposes = data.recentPurposes.length > 0;
  const hasDraft = data.lastDraft !== null && data.lastDraft.inputMessage.trim().length > 0;

  if (!hasRelationships && !hasPurposes && !hasDraft) return null;

  const cardBase =
    "shrink-0 w-64 sm:w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-colors";
  const chipBase =
    "px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer";

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
          최근 사용한 항목
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {hasRelationships && (
          <div className={`${cardBase} snap-start`}>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              최근 관계
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.recentRelationships.map((rel) => (
                <button
                  key={`rel-${rel}`}
                  onClick={() => onPick({ type: "relationship", relationship: rel as RelationshipId })}
                  className={chipBase}
                >
                  {getRelationshipLabel(rel as RelationshipId)}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasPurposes && (
          <div className={`${cardBase} snap-start`}>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              최근 상황
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.recentPurposes.map((p) => (
                <button
                  key={`pur-${p}`}
                  onClick={() => onPick({ type: "purpose", purpose: p as PurposeId })}
                  className={chipBase}
                >
                  {getPurposeLabel(p as PurposeId)}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasDraft && data.lastDraft && (
          <button
            onClick={() => onPick({ type: "draft", draft: data.lastDraft! })}
            className={`${cardBase} snap-start text-left hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer`}
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              마지막 초안 이어가기
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {data.lastDraft.inputMessage.length > 80
                ? `${data.lastDraft.inputMessage.slice(0, 80)}…`
                : data.lastDraft.inputMessage}
            </p>
            {(data.lastDraft.relationship || data.lastDraft.purpose) && (
              <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-2 font-medium">
                {[data.lastDraft.relationship, data.lastDraft.purpose].filter(Boolean).join(" · ")}
              </p>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
