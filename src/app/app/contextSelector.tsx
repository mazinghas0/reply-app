"use client";

import { useState } from "react";

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

// 관계+목적 조합에 따른 전략 필터
function getRelevantStrategies(rel: RelationshipId, purpose: PurposeId): StrategyOption[] {
  // 거절 계열 → 부드러운 방패 + 전략적 여유 우선
  if (purpose === "reject" || purpose === "keepDistance") {
    return [
      STRATEGIES.find((s) => s.id === "softShield")!,
      STRATEGIES.find((s) => s.id === "strategicVague")!,
      STRATEGIES.find((s) => s.id === "warmPro")!,
      STRATEGIES.find((s) => s.id === "straightforward")!,
    ];
  }
  // 썸/애인 계열
  if (rel === "crush" || rel === "partner") {
    return [
      STRATEGIES.find((s) => s.id === "distanceControl")!,
      STRATEGIES.find((s) => s.id === "subtleLead")!,
      STRATEGIES.find((s) => s.id === "straightforward")!,
      STRATEGIES.find((s) => s.id === "strategicVague")!,
    ];
  }
  // 비즈니스 계열
  if (rel === "boss" || rel === "client" || rel === "professor") {
    return [
      STRATEGIES.find((s) => s.id === "warmPro")!,
      STRATEGIES.find((s) => s.id === "softShield")!,
      STRATEGIES.find((s) => s.id === "subtleLead")!,
      STRATEGIES.find((s) => s.id === "straightforward")!,
    ];
  }
  // 기본
  return STRATEGIES;
}

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
  const [step, setStep] = useState<1 | 2 | 3>(value.relationship ? (value.purpose ? 3 : 2) : 1);

  const update = (patch: Partial<ContextSelection>) => {
    onChange({ ...value, ...patch });
  };

  const selectRelationship = (id: RelationshipId) => {
    update({ relationship: id, purpose: null, purposeCustom: "", strategy: null });
    if (id === "custom") {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const selectPurpose = (id: PurposeId) => {
    update({ purpose: id, strategy: null });
    if (id === "custom") {
      // custom이면 전략 단계는 스킵 가능
    }
    setStep(3);
  };

  const selectStrategy = (id: StrategyId) => {
    update({ strategy: id });
  };

  const purposes = value.relationship ? PURPOSE_MAP[value.relationship] : [];
  const strategies = value.relationship && value.purpose
    ? getRelevantStrategies(value.relationship, value.purpose)
    : STRATEGIES;

  const chipBase = "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer text-left";
  const chipDefault = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/20";
  const chipSelected = "border-teal-400 bg-teal-50 text-teal-700 ring-2 ring-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-500 dark:ring-teal-900";

  const stepLabel = (num: number, label: string, active: boolean, completed: boolean) => (
    <button
      onClick={() => { if (completed || active) setStep(num as 1 | 2 | 3); }}
      className={`text-xs font-semibold transition-colors ${
        active ? "text-teal-600 dark:text-teal-400" :
        completed ? "text-slate-600 dark:text-slate-300 cursor-pointer hover:text-teal-500" :
        "text-slate-400 dark:text-slate-600"
      }`}
    >
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-1 ${
        active ? "bg-teal-600 text-white" :
        completed ? "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400" :
        "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
      }`}>{num}</span>
      {label}
      {completed && value.relationship && num === 1 && (
        <span className="ml-1 text-teal-500">
          ({value.relationship === "custom" ? value.relationshipCustom || "기타" : getRelationshipLabel(value.relationship)})
        </span>
      )}
      {completed && value.purpose && num === 2 && (
        <span className="ml-1 text-teal-500">
          ({value.purpose === "custom" ? value.purposeCustom || "기타" : getPurposeLabel(value.purpose)})
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-4">
        {stepLabel(1, "누구에게", step === 1, step > 1)}
        <div className={`h-px flex-1 ${step > 1 ? "bg-teal-300 dark:bg-teal-700" : "bg-slate-200 dark:bg-slate-700"}`} />
        {stepLabel(2, "어떤 답장", step === 2, step > 2)}
        <div className={`h-px flex-1 ${step > 2 ? "bg-teal-300 dark:bg-teal-700" : "bg-slate-200 dark:bg-slate-700"}`} />
        {stepLabel(3, "전략", step === 3, false)}
      </div>

      {/* Step 1: Relationship */}
      {step === 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {RELATIONSHIPS.map((rel) => (
            <button
              key={rel.id}
              onClick={() => selectRelationship(rel.id)}
              className={`${chipBase} ${value.relationship === rel.id ? chipSelected : chipDefault}`}
            >
              <div className="font-semibold text-xs">{rel.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{rel.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Custom relationship input */}
      {step >= 2 && value.relationship === "custom" && (
        <input
          type="text"
          value={value.relationshipCustom}
          onChange={(e) => update({ relationshipCustom: e.target.value })}
          placeholder="상대방이 누구인지 적어주세요 (예: 동네 반장님)"
          maxLength={30}
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
        />
      )}

      {/* Step 2: Purpose */}
      {step === 2 && value.relationship && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {purposes.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPurpose(p.id)}
              className={`${chipBase} ${value.purpose === p.id ? chipSelected : chipDefault}`}
            >
              <div className="font-semibold text-xs">{p.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Custom purpose input */}
      {step >= 3 && value.purpose === "custom" && (
        <input
          type="text"
          value={value.purposeCustom}
          onChange={(e) => update({ purposeCustom: e.target.value })}
          placeholder="어떤 답장을 원하시나요? (예: 약속을 미루고 싶어)"
          maxLength={50}
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
        />
      )}

      {/* Step 3: Strategy */}
      {step === 3 && value.purpose && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {strategies.map((s) => (
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
      )}

      {/* Skip button */}
      {step < 3 && step > 1 && (
        <button
          onClick={() => setStep((step + 1) as 2 | 3)}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          건너뛰기 →
        </button>
      )}
    </div>
  );
}
