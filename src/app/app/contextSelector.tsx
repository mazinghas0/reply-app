"use client";

import { useState, useMemo, useEffect } from "react";
import {
  pushRecentSearchQuery,
  loadRecentSearchQueries,
  pushRecentSituation,
  loadRecentSituations,
  type RecentSituation,
} from "./shared";
import CustomKeywordModal from "./customKeywordModal";
import { IconSpinner } from "./icons";
import {
  type RelationshipId,
  type PurposeId,
  type StrategyId,
  type ContextSelection,
  type CategoryId,
  RELATIONSHIPS,
  PURPOSE_MAP,
  STRATEGIES,
  CATEGORIES,
  ALL_SITUATIONS,
  getRelevantStrategies,
  getRelationshipLabel,
  getPurposeLabel,
} from "./contextData";

export type { RelationshipId, PurposeId, StrategyId, ContextSelection } from "./contextData";
export { getRelationshipLabel, getPurposeLabel, getStrategyPrompt } from "./contextData";

interface CustomKeywordItem {
  id: string;
  kind: "relationship" | "purpose";
  label: string;
  description: string | null;
}

// ─── Component ───────────────────────────────────

interface ContextSelectorProps {
  value: ContextSelection;
  onChange: (value: ContextSelection) => void;
  inputMessage?: string;
  onDetectContext?: () => void;
  detecting?: boolean;
  detectError?: string;
  detectRemaining?: number | null;
  isAuthenticated?: boolean;
}

export default function ContextSelector({
  value,
  onChange,
  inputMessage,
  onDetectContext,
  detecting,
  detectError,
  detectRemaining,
  isAuthenticated,
}: ContextSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openRelGroup, setOpenRelGroup] = useState<RelationshipId | null>(null);
  const [showSearch, setShowSearch] = useState(true);
  const [customKeywords, setCustomKeywords] = useState<CustomKeywordItem[]>([]);
  const [isMaxPlan, setIsMaxPlan] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [customTextInputMode, setCustomTextInputMode] = useState(false);
  const [recentSearchQueries, setRecentSearchQueries] = useState<string[]>([]);
  const [recentSituations, setRecentSituations] = useState<RecentSituation[]>([]);

  useEffect(() => {
    setRecentSearchQueries(loadRecentSearchQueries());
    setRecentSituations(loadRecentSituations());
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/credits")
      .then((r) => r.json())
      .then((d: { plan?: string | null }) => {
        if (!cancelled && d.plan === "max") setIsMaxPlan(true);
      })
      .catch(() => { /* 무시 */ });

    fetch("/api/keywords")
      .then((r) => r.json())
      .then((d: { keywords?: CustomKeywordItem[] }) => {
        if (!cancelled && Array.isArray(d.keywords)) setCustomKeywords(d.keywords);
      })
      .catch(() => { /* 무시 */ });

    return () => {
      cancelled = true;
    };
  }, [showKeywordModal]);

  const customRelationships = useMemo(
    () => customKeywords.filter((k) => k.kind === "relationship"),
    [customKeywords]
  );
  const customPurposes = useMemo(
    () => customKeywords.filter((k) => k.kind === "purpose"),
    [customKeywords]
  );

  const isCustom = customTextInputMode;
  const hasSituation = value.relationship !== null && value.purpose !== null && !isCustom;

  const update = (patch: Partial<ContextSelection>) => {
    onChange({ ...value, ...patch });
  };

  const selectSituation = (rel: RelationshipId, purpose: PurposeId) => {
    onChange({
      relationship: rel,
      relationshipCustom: "",
      purpose,
      purposeCustom: "",
      strategy: null,
    });
    pushRecentSituation(rel, purpose);
    setRecentSituations(loadRecentSituations());
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      pushRecentSearchQuery(trimmedQuery);
      setRecentSearchQueries(loadRecentSearchQueries());
    }
    setSearchQuery("");
    setSelectedCategory(null);
    setCustomTextInputMode(false);
  };

  const clearSituation = () => {
    onChange({
      relationship: null,
      relationshipCustom: "",
      purpose: null,
      purposeCustom: "",
      strategy: null,
    });
    setCustomTextInputMode(false);
  };

  const enterCustomMode = () => {
    onChange({
      relationship: "custom",
      relationshipCustom: "",
      purpose: "custom",
      purposeCustom: "",
      strategy: null,
    });
    setSelectedCategory(null);
    setSearchQuery("");
    setCustomTextInputMode(true);
  };

  const selectCustomRelationship = (kw: CustomKeywordItem) => {
    update({
      relationship: "custom",
      relationshipCustom: kw.label,
      strategy: null,
    });
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const selectCustomPurpose = (kw: CustomKeywordItem) => {
    update({
      purpose: "custom",
      purposeCustom: kw.label,
      strategy: null,
    });
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const selectStrategy = (id: StrategyId) => {
    update({ strategy: value.strategy === id ? null : id });
  };

  const searchResults = useMemo(() => {
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    return ALL_SITUATIONS.filter((s) => {
      const haystack = `${s.relLabel} ${s.relDesc} ${s.purposeLabel} ${s.purposeDesc}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [searchQuery]);

  const categorySituations = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return [];
    return cat.relationships.map(relId => ({
      relId,
      relLabel: RELATIONSHIPS.find(r => r.id === relId)!.label,
      purposes: PURPOSE_MAP[relId].filter(p => p.id !== "custom"),
    }));
  }, [selectedCategory]);

  const strategies = hasSituation && value.relationship && value.purpose
    ? getRelevantStrategies(value.relationship, value.purpose)
    : STRATEGIES;

  const chipBase = "px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer text-left";
  const chipDefault = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/20";
  const chipSelected = "border-teal-400 bg-teal-50 text-teal-700 ring-2 ring-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-500 dark:ring-teal-900";

  // ─── Custom input mode ───
  if (isCustom) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">직접 입력</span>
          <button
            onClick={clearSituation}
            className="text-xs text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
          >
            돌아가기
          </button>
        </div>
        <input
          type="text"
          value={value.relationshipCustom}
          onChange={(e) => update({ relationshipCustom: e.target.value })}
          placeholder="상대방 (예: 동네 반장님, 택배기사)"
          maxLength={30}
          autoFocus
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
        />
        <input
          type="text"
          value={value.purposeCustom}
          onChange={(e) => update({ purposeCustom: e.target.value })}
          placeholder="어떤 답장? (예: 약속을 미루고 싶어)"
          maxLength={50}
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
        />
        {value.relationshipCustom.trim() && value.purposeCustom.trim() && (
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
              전략 <span className="text-slate-400 dark:text-slate-500">(선택)</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STRATEGIES.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectStrategy(s.id)}
                  className={`${chipBase} ${value.strategy === s.id ? chipSelected : chipDefault}`}
                >
                  <div className="font-semibold text-xs">{s.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Selection view (default) ───
  const combinedRelLabel = value.relationship === "custom"
    ? (value.relationshipCustom || "기타")
    : value.relationship !== null
      ? getRelationshipLabel(value.relationship)
      : "";
  const combinedPurposeLabel = value.purpose === "custom"
    ? (value.purposeCustom || "기타")
    : value.purpose !== null
      ? getPurposeLabel(value.purpose)
      : "";

  const partialRelLabel = value.relationship === "custom"
    ? (value.relationshipCustom || "기타")
    : value.relationship !== null
      ? getRelationshipLabel(value.relationship)
      : null;
  const partialPurposeLabel = value.purpose === "custom"
    ? (value.purposeCustom || "기타")
    : value.purpose !== null
      ? getPurposeLabel(value.purpose)
      : null;
  const hasPartial = partialRelLabel !== null || partialPurposeLabel !== null;

  return (
    <div className="space-y-4">
      {hasSituation ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">선택한 상황</span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700 text-sm font-medium text-teal-700 dark:text-teal-300">
            {combinedRelLabel} — {combinedPurposeLabel}
            <button
              onClick={clearSituation}
              className="ml-0.5 text-teal-400 hover:text-teal-600 dark:hover:text-teal-200 transition-colors cursor-pointer"
              aria-label="선택 해제"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : hasPartial && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">선택중</span>
          {partialRelLabel !== null && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700 text-xs font-medium text-teal-700 dark:text-teal-300">
              관계: {partialRelLabel}
              <button
                onClick={() => update({ relationship: null, relationshipCustom: "", strategy: null })}
                className="text-teal-400 hover:text-teal-600 dark:hover:text-teal-200 cursor-pointer"
                aria-label="관계 선택 취소"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {partialPurposeLabel !== null && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700 text-xs font-medium text-teal-700 dark:text-teal-300">
              상황: {partialPurposeLabel}
              <button
                onClick={() => update({ purpose: null, purposeCustom: "", strategy: null })}
                className="text-teal-400 hover:text-teal-600 dark:hover:text-teal-200 cursor-pointer"
                aria-label="상황 선택 취소"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      {hasSituation && (
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
            전략 <span className="text-slate-400 dark:text-slate-500">(선택)</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {strategies.map(s => (
              <button
                key={s.id}
                onClick={() => selectStrategy(s.id)}
                className={`${chipBase} ${value.strategy === s.id ? chipSelected : chipDefault}`}
              >
                <div className="font-semibold text-xs">{s.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* AI 감지 + 최근 조합 — 아무것도 선택되지 않았을 때 핵심 진입점 */}
      {!hasSituation && !hasPartial && (onDetectContext || recentSituations.length > 0) && (
        <div className="space-y-2.5">
          {onDetectContext && isAuthenticated && (
            <div>
              <button
                type="button"
                onClick={onDetectContext}
                disabled={!inputMessage?.trim() || !!detecting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-teal-400 dark:border-teal-600 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold shadow-sm hover:from-teal-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {detecting ? (
                  <>
                    <IconSpinner />
                    상황 감지 중
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.94 14.34 4 20.28l-.28.72.72-.28 5.94-5.94" />
                      <path d="M15 4 20 9l-5.5 5.5-5-5L15 4Z" />
                    </svg>
                    받은 메시지로 상황 자동 감지
                  </>
                )}
              </button>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 dark:text-slate-500">
                  {!inputMessage?.trim() ? "메시지를 먼저 입력하면 AI가 상황을 찾아줘요" : "AI가 관계와 답장 목적을 찾아줘요"}
                </span>
                {detectRemaining !== null && detectRemaining !== undefined && !detectError && (
                  <span className="text-slate-400 dark:text-slate-500">오늘 {detectRemaining}회 남음</span>
                )}
              </div>
              {detectError && (
                <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400">{detectError}</p>
              )}
            </div>
          )}
          {recentSituations.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">최근 선택한 상황</span>
              <div className="flex flex-wrap gap-1.5">
                {recentSituations.slice(0, 3).map((s) => {
                  const relLabel = getRelationshipLabel(s.relationship as RelationshipId);
                  const purposeLabel = getPurposeLabel(s.purpose as PurposeId);
                  return (
                    <button
                      key={`recent-situ-${s.relationship}-${s.purpose}`}
                      onClick={() => selectSituation(s.relationship as RelationshipId, s.purpose as PurposeId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                    >
                      {relLabel} — {purposeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Search toggle */}
      {showSearch ? (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedCategory(null); }}
            placeholder="상대, 상황, 감정 — 예: 상사 거절, 친구 어색함, 사과"
            autoFocus
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          <button
            onClick={() => { setShowSearch(false); setSearchQuery(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer w-full"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          상황 검색
        </button>
      )}

      {/* Search results */}
      {searchQuery.trim() ? (
        searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {searchResults.slice(0, 12).map(s => (
              <button
                key={`${s.relationship}-${s.purpose}`}
                onClick={() => selectSituation(s.relationship, s.purpose)}
                className={`${chipBase} ${chipDefault}`}
              >
                <div className="font-semibold text-xs">{s.relLabel} — {s.purposeLabel}</div>
                <div className="text-[10px] opacity-60 mt-0.5 leading-snug">{s.relDesc} · {s.purposeDesc}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">검색 결과가 없습니다</p>
            <button
              onClick={enterCustomMode}
              className="mt-1.5 text-xs text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
            >
              직접 입력하기
            </button>
          </div>
        )
      ) : (
        <>
          {showSearch && recentSearchQueries.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">최근 검색어</span>
              <div className="flex flex-wrap gap-1.5">
                {recentSearchQueries.map((q) => (
                  <button
                    key={`recent-${q}`}
                    onClick={() => setSearchQuery(q)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <details className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer list-none text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            <span>직접 고르기 — 카테고리 · 내 키워드</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-open:rotate-180">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="p-3 pt-0 space-y-4">
          {/* My custom keywords (Max only) */}
          {(customRelationships.length > 0 || customPurposes.length > 0 || isMaxPlan) && (
            <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  내 키워드
                </span>
                {isMaxPlan && (
                  <button
                    onClick={() => setShowKeywordModal(true)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
                  >
                    + 내 키워드 추가
                  </button>
                )}
              </div>
              {customRelationships.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">관계</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customRelationships.map((kw) => (
                      <button
                        key={`crel-${kw.id}`}
                        onClick={() => selectCustomRelationship(kw)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
                        title={kw.description ?? undefined}
                      >
                        {kw.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {customPurposes.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">상황</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customPurposes.map((kw) => (
                      <button
                        key={`cpur-${kw.id}`}
                        onClick={() => selectCustomPurpose(kw)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
                        title={kw.description ?? undefined}
                      >
                        {kw.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isMaxPlan && customRelationships.length === 0 && customPurposes.length === 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  자주 쓰는 관계나 상황을 직접 등록해 두면 매번 빠르게 사용할 수 있어요.
                </p>
              )}
            </div>
          )}

          {/* Categories */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">카테고리</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (selectedCategory === cat.id) {
                      setSelectedCategory(null);
                      setOpenRelGroup(null);
                    } else {
                      setSelectedCategory(cat.id);
                      const first = CATEGORIES.find(c => c.id === cat.id);
                      setOpenRelGroup(first?.relationships[0] ?? null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={enterCustomMode}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer"
              >
                직접 입력
              </button>
            </div>
          </div>

          {/* Category situations (accordion) */}
          {selectedCategory && (
            <div className="space-y-1">
              {categorySituations.map(group => {
                const isOpen = openRelGroup === group.relId;
                return (
                  <div key={group.relId} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenRelGroup(isOpen ? null : group.relId)}
                      className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>{group.relLabel}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2">
                        {group.purposes.map(p => (
                          <button
                            key={`${group.relId}-${p.id}`}
                            onClick={() => selectSituation(group.relId, p.id)}
                            className={`${chipBase} ${chipDefault} py-2`}
                          >
                            <div className="font-semibold text-xs">{p.label}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </details>
        </>
      )}

      {showKeywordModal && (
        <CustomKeywordModal onClose={() => setShowKeywordModal(false)} />
      )}
    </div>
  );
}
