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

export interface OptionItem<T extends string> {
  id: T;
  label: string;
  desc: string;
}

export interface StrategyOption extends OptionItem<StrategyId> {
  psychology: string;
}

export type CategoryId = "work" | "business" | "school" | "romance" | "friend" | "family";

export interface Category {
  id: CategoryId;
  label: string;
  relationships: RelationshipId[];
}

export interface FlatSituation {
  relationship: RelationshipId;
  purpose: PurposeId;
  relLabel: string;
  relDesc: string;
  purposeLabel: string;
  purposeDesc: string;
}

// ─── Data ────────────────────────────────────────

export const RELATIONSHIPS: OptionItem<RelationshipId>[] = [
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

export const PURPOSE_MAP: Record<RelationshipId, OptionItem<PurposeId>[]> = {
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

export const STRATEGIES: StrategyOption[] = [
  { id: "softShield", label: "부드러운 방패", desc: "거절인데 상처 안 주게", psychology: "쿠션 화법 + 대안 제시" },
  { id: "subtleLead", label: "은근한 주도권", desc: "내가 대화를 리드", psychology: "프레이밍 효과" },
  { id: "warmPro", label: "따뜻한 프로", desc: "격식 있되 차갑지 않게", psychology: "전문성 + 호감 균형" },
  { id: "straightforward", label: "솔직 담백", desc: "핵심만 딱", psychology: "직설 화법" },
  { id: "strategicVague", label: "전략적 여유", desc: "확답 없이 여지 남기기", psychology: "선택지 열어두기" },
  { id: "distanceControl", label: "거리 조절", desc: "가까워지거나 멀어지는", psychology: "심리적 밀당" },
];

export const CATEGORIES: Category[] = [
  { id: "work", label: "직장", relationships: ["boss", "colleague", "subordinate"] },
  { id: "business", label: "비즈니스", relationships: ["client"] },
  { id: "school", label: "학교", relationships: ["professor", "senior"] },
  { id: "romance", label: "연애", relationships: ["partner", "crush"] },
  { id: "friend", label: "친구", relationships: ["friend"] },
  { id: "family", label: "가족", relationships: ["family"] },
];

export const ALL_SITUATIONS: FlatSituation[] = (Object.keys(PURPOSE_MAP) as RelationshipId[])
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

// ─── Helpers ─────────────────────────────────────

export function getRelevantStrategies(rel: RelationshipId, purpose: PurposeId): StrategyOption[] {
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
