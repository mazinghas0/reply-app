"use client";

import { useState, useMemo, useEffect } from "react";
import { pushRecentRelationship, pushRecentPurpose } from "./shared";
import CustomKeywordModal from "./customKeywordModal";

interface CustomKeywordItem {
  id: string;
  kind: "relationship" | "purpose";
  label: string;
  description: string | null;
}

// ─── Types ───────────────────────────────────────

export type RelationshipId =
  | "boss"
  | "colleague"
  | "subordinate"
  | "client"
  | "professor"
  | "senior"
  | "friend"
  | "partner"
  | "crush"
  | "family"
  | "custom";

export type PurposeId =
  | "accept"
  | "reject"
  | "report"
  | "suggest"
  | "ask"
  | "thank"
  | "apologize"
  | "schedule"
  | "urge"
  | "negotiate"
  | "complain"
  | "comfort"
  | "congrats"
  | "reconcile"
  | "dateAsk"
  | "keepDistance"
  | "appeal"
  | "react"
  | "greet"
  | "custom";

export type StrategyId =
  | "softShield"
  | "subtleLead"
  | "warmPro"
  | "straightforward"
  | "strategicVague"
  | "distanceControl";

export interface ContextSelection {
  relationship: RelationshipId | null;
  relationshipCustom: string;
  purpose: PurposeId | null;
  purposeCustom: string;
  strategy: StrategyId | null;
}

// ─── Data ────────────────────────────────────────

interface OptionItem<T extends string> {
  id: T;
  label: string;
  desc: string;
}

const RELATIONSHIPS: OptionItem<RelationshipId>[] = [
  { id: "boss", label: "상사", desc: "직장 윗사람" },
  { id: "colleague", label: "동료", desc: "같은 직급" },
  { id: "subordinate", label: "부하직원", desc: "직장 아랫사람" },
  { id: "client", label: "거래처", desc: "비즈니스 파트너" },
  { id: "professor", label: "교수/선생님", desc: "학교/학원" },
  { id: "senior", label: "선후배", desc: "학교/군대/동아리" },
  { id: "friend", label: "친구", desc: "편한 사이" },
  { id: "partner", label: "애인", desc: "연인 관계" },
  { id: "crush", label: "썸", desc: "아직 확실하지 않은" },
  { id: "family", label: "가족", desc: "부모/형제/친척" },
  { id: "custom", label: "기타", desc: "직접 입력" },
];

const PURPOSE_MAP: Record<RelationshipId, OptionItem<PurposeId>[]> = {
  boss: [
    { id: "report", label: "보고", desc: "업무 진행 상황" },
    { id: "accept", label: "수락", desc: "지시 승인" },
    { id: "reject", label: "거절", desc: "정중하게 안 된다고" },
    { id: "suggest", label: "의견 제시", desc: "제안이나 대안" },
    { id: "apologize", label: "사과", desc: "실수나 지연" },
    { id: "schedule", label: "일정 조율", desc: "미팅/회의 시간" },
    { id: "ask", label: "질문", desc: "확인이 필요한 것" },
  ],
  colleague: [
    { id: "accept", label: "수락", desc: "요청 OK" },
    { id: "reject", label: "거절", desc: "부담 없이 안 된다고" },
    { id: "suggest", label: "제안", desc: "아이디어나 방법" },
    { id: "ask", label: "부탁", desc: "도움 요청" },
    { id: "schedule", label: "일정", desc: "약속 잡기" },
    { id: "thank", label: "감사", desc: "고마움 표현" },
  ],
  subordinate: [
    { id: "suggest", label: "지시/요청", desc: "업무 전달" },
    { id: "thank", label: "격려", desc: "수고했다는 말" },
    { id: "reject", label: "피드백", desc: "수정 요청" },
    { id: "schedule", label: "일정", desc: "마감/미팅" },
    { id: "ask", label: "확인", desc: "진행 상황 체크" },
  ],
  client: [
    { id: "suggest", label: "제안", desc: "상품/서비스 소개" },
    { id: "reject", label: "거절", desc: "정중한 사양" },
    { id: "urge", label: "독촉", desc: "답변/납품 요청" },
    { id: "thank", label: "감사", desc: "거래 감사" },
    { id: "negotiate", label: "협상", desc: "가격/조건 조율" },
    { id: "complain", label: "클레임", desc: "문제 제기/대응" },
    { id: "schedule", label: "미팅", desc: "일정 잡기" },
  ],
  professor: [
    { id: "ask", label: "질문", desc: "수업/과제 관련" },
    { id: "reject", label: "사정 설명", desc: "못 하는 이유" },
    { id: "thank", label: "감사", desc: "도움에 대한 감사" },
    { id: "apologize", label: "사과", desc: "지각/미제출" },
    { id: "suggest", label: "요청", desc: "상담/추천서" },
  ],
  senior: [
    { id: "accept", label: "수락", desc: "알겠다는 답" },
    { id: "reject", label: "거절", desc: "정중한 사양" },
    { id: "ask", label: "부탁", desc: "조언이나 도움" },
    { id: "thank", label: "감사", desc: "고마움 표현" },
    { id: "greet", label: "안부", desc: "오랜만에 연락" },
  ],
  friend: [
    { id: "reject", label: "거절", desc: "미안한데 안 돼" },
    { id: "comfort", label: "위로", desc: "힘든 친구에게" },
    { id: "congrats", label: "축하", desc: "좋은 소식에" },
    { id: "schedule", label: "약속", desc: "만남 잡기" },
    { id: "reconcile", label: "화해", desc: "싸운 후 먼저" },
    { id: "react", label: "리액션", desc: "뭐라고 답해야 할지" },
  ],
  partner: [
    { id: "comfort", label: "위로", desc: "힘들어하는 상대" },
    { id: "apologize", label: "사과", desc: "내 잘못 인정" },
    { id: "reject", label: "솔직한 말", desc: "불편한 걸 말하기" },
    { id: "react", label: "리액션", desc: "대화 이어가기" },
    { id: "schedule", label: "데이트", desc: "만남 계획" },
    { id: "thank", label: "애정 표현", desc: "고마움/사랑" },
  ],
  crush: [
    { id: "react", label: "자연스러운 대화", desc: "대화 이어가기" },
    { id: "dateAsk", label: "데이트 제안", desc: "만남 유도" },
    { id: "keepDistance", label: "거리 유지", desc: "너무 앞서가지 않게" },
    { id: "appeal", label: "은근한 어필", desc: "관심 표현" },
    { id: "comfort", label: "관심 표현", desc: "걱정하는 마음" },
    { id: "reject", label: "선 긋기", desc: "관심 없다는 신호" },
  ],
  family: [
    { id: "greet", label: "안부", desc: "잘 지내냐는 말" },
    { id: "ask", label: "부탁", desc: "도움 요청" },
    { id: "reject", label: "거절", desc: "사정이 안 돼서" },
    { id: "thank", label: "감사", desc: "고마움 표현" },
    { id: "apologize", label: "사과", desc: "미안한 마음" },
    { id: "comfort", label: "위로", desc: "힘든 가족에게" },
  ],
  custom: [
    { id: "accept", label: "수락", desc: "OK" },
    { id: "reject", label: "거절", desc: "안 된다고" },
    { id: "ask", label: "질문/부탁", desc: "도움 요청" },
    { id: "thank", label: "감사", desc: "고마움" },
    { id: "apologize", label: "사과", desc: "미안함" },
    { id: "suggest", label: "제안", desc: "의견 제시" },
    { id: "react", label: "리액션", desc: "대화 이어가기" },
    { id: "custom", label: "기타", desc: "직접 입력" },
  ],
};

interface StrategyOption extends OptionItem<StrategyId> {
  psychology: string;
}

const STRATEGIES: StrategyOption[] = [
  { id: "softShield", label: "부드러운 방패", desc: "거절인데 상처 안 주게", psychology: "쿠션 화법 + 대안 제시" },
  { id: "subtleLead", label: "은근한 주도권", desc: "내가 대화를 리드", psychology: "프레이밍 효과" },
  { id: "warmPro", label: "따뜻한 프로", desc: "격식 있되 차갑지 않게", psychology: "전문성 + 호감 균형" },
  { id: "straightforward", label: "솔직 담백", desc: "핵심만 딱", psychology: "직설 화법" },
  { id: "strategicVague", label: "전략적 여유", desc: "확답 없이 여지 남기기", psychology: "선택지 열어두기" },
  { id: "distanceControl", label: "거리 조절", desc: "가까워지거나 멀어지는", psychology: "심리적 밀당" },
];

function getRelevantStrategies(rel: RelationshipId, purpose: PurposeId): StrategyOption[] {
  const priority: StrategyId[] = (() => {
    if (purpose === "reject" || purpose === "keepDistance") {
      return ["softShield", "strategicVague", "warmPro", "straightforward", "subtleLead", "distanceControl"];
    }
    if (rel === "crush" || rel === "partner") {
      return ["distanceControl", "subtleLead", "straightforward", "strategicVague", "warmPro", "softShield"];
    }
    if (rel === "boss" || rel === "client" || rel === "professor") {
      return ["warmPro", "softShield", "subtleLead", "straightforward", "strategicVague", "distanceControl"];
    }
    return STRATEGIES.map((s) => s.id);
  })();
  return priority.map((id) => STRATEGIES.find((s) => s.id === id)!);
}

// ─── Categories & Popular Situations ─────────────

type CategoryId = "work" | "business" | "school" | "romance" | "friend" | "family";

interface Category {
  id: CategoryId;
  label: string;
  relationships: RelationshipId[];
}

const CATEGORIES: Category[] = [
  { id: "work", label: "직장", relationships: ["boss", "colleague", "subordinate"] },
  { id: "business", label: "비즈니스", relationships: ["client"] },
  { id: "school", label: "학교", relationships: ["professor", "senior"] },
  { id: "romance", label: "연애", relationships: ["partner", "crush"] },
  { id: "friend", label: "친구", relationships: ["friend"] },
  { id: "family", label: "가족", relationships: ["family"] },
];

interface PopularSituation {
  relationship: RelationshipId;
  purpose: PurposeId;
  label: string;
}

const POPULAR_SITUATIONS: PopularSituation[] = [
  { relationship: "boss", purpose: "reject", label: "상사에게 거절" },
  { relationship: "client", purpose: "urge", label: "거래처에 독촉" },
  { relationship: "crush", purpose: "react", label: "썸 대화 이어가기" },
  { relationship: "friend", purpose: "comfort", label: "친구 위로" },
  { relationship: "professor", purpose: "ask", label: "교수님께 질문" },
  { relationship: "colleague", purpose: "ask", label: "동료에게 부탁" },
  { relationship: "partner", purpose: "apologize", label: "애인에게 사과" },
  { relationship: "family", purpose: "greet", label: "가족에게 안부" },
];

interface FlatSituation {
  relationship: RelationshipId;
  purpose: PurposeId;
  relLabel: string;
  relDesc: string;
  purposeLabel: string;
  purposeDesc: string;
}

const ALL_SITUATIONS: FlatSituation[] = (Object.keys(PURPOSE_MAP) as RelationshipId[])
  .filter(rel => rel !== "custom")
  .flatMap(rel => {
    const relItem = RELATIONSHIPS.find(r => r.id === rel)!;
    return PURPOSE_MAP[rel]
      .filter(p => p.id !== "custom")
      .map(p => ({
        relationship: rel,
        purpose: p.id,
        relLabel: relItem.label,
        relDesc: relItem.desc,
        purposeLabel: p.label,
        purposeDesc: p.desc,
      }));
  });

// ─── Export: label 텍스트 변환 (API 프롬프트용) ────

export function getRelationshipLabel(id: RelationshipId): string {
  return RELATIONSHIPS.find((r) => r.id === id)?.label ?? id;
}

export function getPurposeLabel(id: PurposeId): string {
  const all = Object.values(PURPOSE_MAP).flat();
  return all.find((p) => p.id === id)?.label ?? id;
}

export function getStrategyPrompt(id: StrategyId): string {
  const s = STRATEGIES.find((st) => st.id === id);
  if (!s) return "";
  return `${s.label} — ${s.desc} (${s.psychology})`;
}

// ─── Component ───────────────────────────────────

interface ContextSelectorProps {
  value: ContextSelection;
  onChange: (value: ContextSelection) => void;
}

export default function ContextSelector({ value, onChange }: ContextSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openRelGroup, setOpenRelGroup] = useState<RelationshipId | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [customKeywords, setCustomKeywords] = useState<CustomKeywordItem[]>([]);
  const [isMaxPlan, setIsMaxPlan] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [customTextInputMode, setCustomTextInputMode] = useState(false);

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
    pushRecentRelationship(rel);
    pushRecentPurpose(purpose);
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
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_SITUATIONS.filter(
      s => s.relLabel.includes(q) || s.relDesc.includes(q) ||
           s.purposeLabel.includes(q) || s.purposeDesc.includes(q)
    );
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
            placeholder="상황 검색 (예: 거절, 상사, 데이트...)"
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
                <div className="text-[10px] opacity-60 mt-0.5">{s.purposeDesc}</div>
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

          {/* Popular situations */}
          {!selectedCategory && (
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">인기 상황</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {POPULAR_SITUATIONS.map(s => (
                  <button
                    key={`pop-${s.relationship}-${s.purpose}`}
                    onClick={() => selectSituation(s.relationship, s.purpose)}
                    className="px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer text-center"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
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
        </>
      )}

      {showKeywordModal && (
        <CustomKeywordModal onClose={() => setShowKeywordModal(false)} />
      )}
    </div>
  );
}
