export interface NewsItem {
  id: number;
  version: string;
  date: string;
  title: string;
  items: string[];
}

const NEWS_KEY = "reply-news-seen";

export const NEWS: NewsItem[] = [
  {
    id: 3,
    version: "v1.2.0",
    date: "2026-04-08",
    title: "체험 모달 + 플랜 뱃지 + UX 개선",
    items: [
      "랜딩 체험 모달: 가입 없이 '먼저 체험하기'로 AI 답장을 바로 경험",
      "플랜 뱃지: 크레딧 잔량에 따라 색상이 변하고, 터치하면 미니 카드로 상세 확인",
      "탭 기능 안내: 각 탭 아래에 기능 설명이 자동 표시",
      "신규 가입 웰컴: 로그인 시 10크레딧 안내 메시지",
      "로그인 유도: 첫 답장 생성 후 히스토리 저장 안내",
      "ChatGPT 비교: 랜딩에서 리플라이만의 차별점을 한눈에 확인",
    ],
  },
  {
    id: 2,
    version: "v1.1.0",
    date: "2026-04-08",
    title: "월간 크레딧 시스템 도입",
    items: [
      "월 10크레딧: 로그인하면 매달 10크레딧 자동 충전 (답장 만들기, 검토, 다듬기 모두 3크레딧)",
      "크레딧 통합: 기능별 따로 카운트하던 일일 제한 대신, 하나의 크레딧으로 자유롭게 사용",
      "모바일 새로고침 방지: 스크롤 중 실수로 페이지가 리셋되지 않도록 개선",
    ],
  },
  {
    id: 1,
    version: "v1.0.0",
    date: "2026-04-07",
    title: "리플라이 정식 출시",
    items: [
      "맞춤형 답장: 관계(11종) > 목적 > 전략(6종) 3단계로 상황에 딱 맞는 답장 생성",
      "답장 확장: 생성된 답장을 '더 강하게 / 부드럽게 / 짧게' 조절",
      "다듬기 탭: 대충 쓴 답장을 톤에 맞게 깔끔하게 다듬기",
      "답장 검토: 맞춤법·톤·인상·개선 4가지 관점 분석",
      "Chrome 확장: 우클릭 메뉴로 어디서든 빠르게 답장 생성",
      "PWA 지원: 홈 화면에 추가하면 앱처럼 사용",
      "모바일 공유: 안드로이드 공유 메뉴 + 클립보드 자동 감지",
      "연속 사용 스트릭: 매일 사용하면 불꽃 아이콘으로 기록",
    ],
  },
];

export function getLatestNewsId(): number {
  return NEWS.length > 0 ? NEWS[0].id : 0;
}

export function getSeenNewsId(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(NEWS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function markNewsSeen(): void {
  try {
    localStorage.setItem(NEWS_KEY, String(getLatestNewsId()));
  } catch {
    /* noop */
  }
}

export function hasUnreadNews(): boolean {
  return getLatestNewsId() > getSeenNewsId();
}
