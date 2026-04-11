// ─── Types ───────────────────────────────────────

export type AppMode = "generate" | "review" | "refine";

export interface Reply {
  label: string;
  content: string;
}

export interface ReviewScores {
  politeness: number;
  pressure: number;
  misunderstanding: number;
  clarity: number;
}

export interface ReviewResult {
  spelling: Array<{ original: string; corrected: string; reason: string }>;
  tone: { label: string; score: number; detail: string };
  impression: string;
  suggestions: Array<{ original: string; improved: string; reason: string }>;
  scores?: ReviewScores;
  warnings?: string[];
}

export interface HistoryEntry {
  id: string;
  inputMessage: string;
  tone: ToneId;
  speed: Speed;
  replies: Reply[];
  createdAt: string;
}

export type Speed = "fast" | "quality";

// ─── Constants ───────────────────────────────────

export const TONES = [
  { id: "polite", label: "정중한", desc: "예의 바르고 격식 있는" },
  { id: "firm", label: "단호한", desc: "명확하고 프로페셔널한" },
  { id: "flexible", label: "유연한", desc: "열린 자세, 협상 가능한" },
  { id: "friendly", label: "친근한", desc: "편하고 가벼운" },
] as const;

export type ToneId = (typeof TONES)[number]["id"];

export const TONE_STYLES: Record<ToneId, { selected: string; hover: string }> = {
  polite: {
    selected: "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-500 dark:ring-blue-900",
    hover: "hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20",
  },
  firm: {
    selected: "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-500 dark:ring-rose-900",
    hover: "hover:border-rose-200 hover:bg-rose-50/50 dark:hover:border-rose-800 dark:hover:bg-rose-900/20",
  },
  flexible: {
    selected: "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500 dark:ring-emerald-900",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/20",
  },
  friendly: {
    selected: "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500 dark:ring-amber-900",
    hover: "hover:border-amber-200 hover:bg-amber-50/50 dark:hover:border-amber-800 dark:hover:bg-amber-900/20",
  },
};

export const TONE_COLORS: Record<ToneId, string> = {
  polite: "border-l-blue-400",
  firm: "border-l-rose-400",
  flexible: "border-l-emerald-400",
  friendly: "border-l-amber-400",
};

export const SPEEDS: Array<{ id: Speed; label: string; desc: string }> = [
  { id: "quality", label: "정교한 답장", desc: "중요한 비즈니스" },
  { id: "fast", label: "빠른 답장", desc: "일상적인 메시지" },
];

export const SPEED_LABELS: Record<Speed, string> = {
  fast: "빠른",
  quality: "정교한",
};

// ─── Example Scenarios (예시로 해보기) ──────────

export interface ExampleScenario {
  label: string;
  message: string;
  relationship: "boss" | "colleague" | "crush";
  purpose: "reject" | "schedule" | "react";
  tone: ToneId;
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    label: "직장 회의",
    message: "내일 오전 10시 회의 참석 가능하신가요? 안건은 Q2 매출 리뷰입니다.",
    relationship: "boss",
    purpose: "schedule",
    tone: "polite",
  },
  {
    label: "과제 마감",
    message: "교수님, 과제 제출 기한을 하루만 연장해주실 수 있을까요? 자료 정리가 조금 더 필요합니다.",
    relationship: "colleague",
    purpose: "reject",
    tone: "flexible",
  },
  {
    label: "썸 답장",
    message: "어제 보내준 노래 좋더라~ 요즘 이런 장르 많이 듣는 거야?",
    relationship: "crush",
    purpose: "react",
    tone: "friendly",
  },
];

// ─── Streak ─────────────────────────────────────

export const REFERRAL_BONUS = 20;

export const HISTORY_KEY_GENERATE = "reply-history";
export const HISTORY_KEY_REVIEW = "reply-history-review";
export const HISTORY_KEY_REFINE = "reply-history-refine";
export const MAX_HISTORY = 10;

export interface ReviewHistoryEntry {
  id: string;
  draft: string;
  context: string;
  result: ReviewResult;
  createdAt: string;
}
const STREAK_KEY = "reply-streak";

export interface StreakData {
  lastDate: string;
  count: number;
}

export function loadStreak(): StreakData {
  if (typeof window === "undefined") return { lastDate: "", count: 0 };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { lastDate: "", count: 0 };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { lastDate: "", count: 0 };
  }
}

export function updateStreak(): StreakData {
  const today = new Date().toISOString().slice(0, 10);
  const prev = loadStreak();
  if (prev.lastDate === today) return prev;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const yesterdayStr = yesterday;
  const next: StreakData = prev.lastDate === yesterdayStr
    ? { lastDate: today, count: prev.count + 1 }
    : { lastDate: today, count: 1 };

  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

// ─── Utility Functions ───────────────────────────

export function loadHistory(key: string = HISTORY_KEY_GENERATE): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry, key: string = HISTORY_KEY_GENERATE): HistoryEntry[] {
  const history = loadHistory(key);
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(key, JSON.stringify(history));
  return history;
}

export function loadReviewHistory(): ReviewHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY_REVIEW);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveReviewHistory(entry: ReviewHistoryEntry): ReviewHistoryEntry[] {
  const history = loadReviewHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY_REVIEW, JSON.stringify(history));
  return history;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ─── Favorites ──────────────────────────────────

const FAVORITES_KEY = "reply-favorites";

export function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(id: string): Set<string> {
  const favs = loadFavorites();
  if (favs.has(id)) {
    favs.delete(id);
  } else {
    favs.add(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  return new Set(favs);
}

// ─── Quick Actions (퀵액션 홈) ───────────────────

const RECENT_RELATIONSHIPS_KEY = "reply-recent-relationships";
const RECENT_PURPOSES_KEY = "reply-recent-purposes";
const RECENT_SEARCH_QUERIES_KEY = "reply-recent-search-queries";
const LAST_DRAFT_KEY = "reply-last-draft";
const RECENT_MAX = 5;

export interface LastDraft {
  inputMessage: string;
  relationship: string | null;
  purpose: string | null;
  tone: ToneId;
  savedAt: string;
}

export interface QuickActionsData {
  recentRelationships: string[];
  recentPurposes: string[];
  lastDraft: LastDraft | null;
}

function pushRecent(key: string, value: string): void {
  if (typeof window === "undefined") return;
  if (!value) return;
  try {
    const raw = localStorage.getItem(key);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const filtered = list.filter((v) => v !== value);
    filtered.unshift(value);
    if (filtered.length > RECENT_MAX) filtered.length = RECENT_MAX;
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // 무시
  }
}

export function pushRecentRelationship(value: string): void {
  pushRecent(RECENT_RELATIONSHIPS_KEY, value);
}

export function pushRecentPurpose(value: string): void {
  pushRecent(RECENT_PURPOSES_KEY, value);
}

export function pushRecentSearchQuery(value: string): void {
  pushRecent(RECENT_SEARCH_QUERIES_KEY, value);
}

export function loadRecentSearchQueries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_QUERIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveLastDraft(draft: LastDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // 무시
  }
}

function loadList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function loadQuickActions(): QuickActionsData {
  if (typeof window === "undefined") {
    return { recentRelationships: [], recentPurposes: [], lastDraft: null };
  }
  let lastDraft: LastDraft | null = null;
  try {
    const raw = localStorage.getItem(LAST_DRAFT_KEY);
    if (raw) lastDraft = JSON.parse(raw) as LastDraft;
  } catch {
    lastDraft = null;
  }
  return {
    recentRelationships: loadList(RECENT_RELATIONSHIPS_KEY),
    recentPurposes: loadList(RECENT_PURPOSES_KEY),
    lastDraft,
  };
}
