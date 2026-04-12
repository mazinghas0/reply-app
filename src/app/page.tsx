import Link from "next/link";
import type { Metadata } from "next";
import HeroDemo from "./heroDemo";
import LandingAuth from "./landingAuth";
import TrialButton from "./trialButton";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "리플라이 — 어떻게 말하면 좋을까, 그 고민을 AI가 돕습니다",
  description:
    "상사 카톡, 썸 답장, 사춘기 자녀와의 대화 — 관계와 상황을 고르면 AI가 말투까지 맞춰 드려요. 답장 3초면 끝.",
  keywords: [
    "AI 답장",
    "답장 생성",
    "메시지 답장",
    "카톡 답장",
    "비즈니스 메시지",
    "답장 도우미",
    "거절 답장",
    "사과 답장",
    "사춘기 자녀 대화",
    "부모 자녀 대화",
    "감정 대화",
    "말투 코칭",
    "메시지 말하기",
    "답장 검토",
  ],
  openGraph: {
    title: "리플라이 — 어떻게 말하면 좋을까, 그 고민을 AI가 돕습니다",
    description:
      "상사 카톡도, 썸 답장도, 사춘기 자녀와의 대화도 — 관계와 상황을 고르면 AI가 말투까지 맞춰 드려요.",
    type: "website",
    url: "https://aireply.co.kr",
    siteName: "리플라이",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "리플라이 — 어떻게 말하면 좋을까, 그 고민을 AI가 돕습니다",
    description: "상사 카톡, 썸 답장, 사춘기 자녀 대화까지. 말투 고민은 리플라이에 맡기세요.",
  },
  alternates: {
    canonical: "https://aireply.co.kr",
  },
};

// ─── 상수 ───────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "메시지 붙여넣기",
    desc: "답장하고 싶은 메시지를 복사해서 붙여넣으세요",
  },
  {
    number: "02",
    title: "톤 선택",
    desc: "정중 · 단호 · 유연 · 친근 중 원하는 톤을 고르세요",
  },
  {
    number: "03",
    title: "답장 복사",
    desc: "AI가 만든 3가지 답장 중 마음에 드는 걸 복사하세요",
  },
];

const PERSONAS = [
  {
    emoji: "briefcase",
    who: "직장인",
    situation: "상사한테 온 카톡, 어떻게 답할지 10분째 고민 중",
    solution: "관계를 '상사'로 설정하면 격식과 뉘앙스를 맞춘 답장 3개가 바로 나와요.",
    feature: "맞춤형 답장",
  },
  {
    emoji: "school",
    who: "대학생",
    situation: "교수님한테 메일 써야 하는데 격식체가 너무 어려워",
    solution: "하고 싶은 말을 넣고 '정중' 톤을 고르면 예의 바른 메일이 완성돼요.",
    feature: "말하기",
  },
  {
    emoji: "heart",
    who: "썸 타는 사람",
    situation: "답장이 너무 가벼워도, 무거워도 안 되는 미묘한 상황",
    solution: "답장을 만들고 '더 부드럽게' '더 짧게'로 강도를 조절할 수 있어요.",
    feature: "답장 확장",
  },
  {
    emoji: "family-heart",
    who: "청소년 자녀 부모",
    situation: "사춘기 딸한테서 '아빠 짜증나' — 혼낼 수도, 그냥 넘길 수도 없을 때",
    solution: "관계를 '가족'으로, 상황을 '위로'나 '격려'로 고르면 아이 마음에 닿는 말투로 바꿔줘요.",
    feature: "가족 대화",
  },
];

// ─── 아이콘 ─────────────────────────────────────

function ChatIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-teal-400 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PersonaIcon({ type }: { type: string }) {
  const cls = "w-10 h-10 rounded-xl flex items-center justify-center shrink-0";
  switch (type) {
    case "briefcase":
      return (
        <div className={`${cls} bg-blue-950/50 text-blue-400`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
        </div>
      );
    case "school":
      return (
        <div className={`${cls} bg-violet-950/50 text-violet-400`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
          </svg>
        </div>
      );
    case "heart":
      return (
        <div className={`${cls} bg-rose-950/50 text-rose-400`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      );
    case "family-heart":
      return (
        <div className={`${cls} bg-emerald-950/50 text-emerald-400`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8.5c.5-.8 1.4-1.5 2.5-1.5 1.5 0 2.5 1.2 2.5 2.6 0 2.1-3 4.4-5 5.9-2-1.5-5-3.8-5-5.9 0-1.4 1-2.6 2.5-2.6 1.1 0 2 .7 2.5 1.5z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}


// ─── 랜딩 페이지 ────────────────────────────────

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-slate-950 text-slate-100">
      {/* 내비게이션 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
              <ChatIcon size={14} />
            </div>
            <span className="font-bold text-lg text-white">리플라이</span>
          </div>
          <div className="flex items-center gap-3">
            {clerkEnabled && <LandingAuth />}
            <Link
              href="/app"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative px-4 pt-24 pb-20 overflow-hidden">
        {/* 배경 글로우 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-semibold text-teal-400 tracking-wide mb-4">
            답장 고민, 이제 끝
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            상사 카톡에 10분째 멈춰 있다면
            <br />
            <span className="text-teal-400">리플라이</span>가 대신 고민해 드릴게요
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            썸 상대의 애매한 답장, 사춘기 딸의 &ldquo;아빠 짜증나&rdquo;,
            <br className="hidden sm:block" />
            거래처 거절 메일까지 —
            <br className="hidden sm:block" />
            <span className="text-slate-300">관계와 상황만 고르면 말투까지 맞춘 답장 3개</span>가 바로 나와요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all text-center"
            >
              무료로 시작하기
            </Link>
            <TrialButton />
          </div>
        </div>

        {/* 라이브 데모 */}
        <div className="relative max-w-lg mx-auto">
          <div className="p-6 bg-slate-900/80 border border-slate-800/60 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
              <span className="ml-2 text-xs text-slate-600">리플라이 미리보기</span>
            </div>
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-16">
            3단계로 끝나는 답장
          </h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <span className="block text-3xl font-bold text-teal-500/30 mb-3 tabular-nums">
                  {step.number}
                </span>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 그냥 AI와 다른 점 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            &ldquo;그냥 AI에게 물어보면 되지 않나요?&rdquo;
          </h2>
          <p className="text-center text-slate-400 mb-14">
            답장 고민은 &lsquo;뭐라고 쓸지&rsquo;가 아니라 &lsquo;어떻게 말할지&rsquo;예요
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-sm font-semibold text-slate-500 mb-4">그냥 AI</p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  &ldquo;정중하게 거절해줘&rdquo;라고 직접 설명해야 해요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  번역체 &middot; 교과서체가 은근히 섞여요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  매번 상황을 다시 설명해야 해요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  답장은 한 개뿐 &middot; 직접 복사 &middot; 붙여넣기
                </li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-800/40">
              <p className="text-sm font-semibold text-teal-400 mb-4">리플라이</p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  메시지 붙여넣기 한 번이면 끝
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  한국인이 실제로 쓰는 자연스러운 문체
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  관계 &middot; 목적 &middot; 전략 3단계 맞춤 설정
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  원터치 복사 + 히스토리 자동 저장
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 이런 상황에서 쓰세요 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            이런 상황에서 쓰세요
          </h2>
          <p className="text-center text-slate-400 mb-14">
            답장 고민, 누구나 해봤잖아요
          </p>
          <div className="grid gap-6">
            {PERSONAS.map((p) => (
              <div
                key={p.who}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="flex items-center gap-3 sm:min-w-[120px]">
                  <PersonaIcon type={p.emoji} />
                  <span className="font-semibold text-white">{p.who}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 mb-2">
                    &ldquo;{p.situation}&rdquo;
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {p.solution}
                  </p>
                  <span className="inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-950/50 text-teal-400 border border-teal-800/40">
                    {p.feature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            답장, 이렇게 달라져요
          </h2>
          <p className="text-center text-slate-400 mb-14">
            그냥 AI가 아니라, 답장 전문 AI입니다
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-800/40 relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide">NEW</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.94 14.34 4 20.28l-.28.72.72-.28 5.94-5.94" />
                  <path d="M15 4 20 9l-5.5 5.5-5-5L15 4Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">AI 상황 자동 감지</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                메시지를 붙여넣으면 AI가 관계와 답장 목적을 자동으로 찾아드려요. 고민은 짧게, 답장은 빠르게.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-teal-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 9h8M8 13h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">답장 3개, 한 번에</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                같은 메시지에 톤만 다른 답장 3개를 동시에 받아서 비교하고, 마음에 드는 걸 바로 복사하세요.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-blue-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">11가지 관계 맞춤</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                상사, 동료, 거래처, 친구, 연인, 가족까지. 관계를 고르면 격식과 뉘앙스를 자동으로 맞춰 줍니다.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-violet-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">검토 &amp; 말하기</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                내가 쓴 답장의 맞춤법, 톤, 상대방 인상까지 분석. 하고 싶은 말을 완성된 메시지로 만들어 줍니다.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-rose-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M9 12h6" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">확장 &amp; 축소</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                &ldquo;더 짧게&rdquo;, &ldquo;더 부드럽게&rdquo;, &ldquo;더 정중하게&rdquo; — 답장의 세기와 길이를 자유롭게 조절하세요.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M14 9a2 2 0 0 0-2-2 2 2 0 0 0-2 2c0 1.1.9 2 2 2s2 .9 2 2a2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">자연스러운 한국어</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                번역체, 교과서체 없이 카톡에서 실제로 쓰는 말투로 답장을 만들어 줍니다. AI가 쓴 티가 나지 않아요.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              지금은 완전 무료 — 가입만 하면 월 10크레딧
            </p>
          </div>
        </div>
      </section>

      {/* 검토 기능 소개 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            보내기 전에, 한 번 더 확인하세요
          </h2>
          <p className="text-center text-slate-400 mb-14">
            내가 쓴 답장이 상대방에게 어떤 인상을 주는지 AI가 분석해 드려요
          </p>
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800/60">
            <div className="mb-5 p-4 rounded-xl bg-slate-800/50">
              <p className="text-xs text-slate-500 mb-2">내가 쓴 답장</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                &ldquo;네 알겠습니다. 그렇게 하겠습니다. 다음부터 주의하겠습니다.&rdquo;
              </p>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">공손함</span>
                  <span className="text-sm font-semibold text-teal-400">85%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-teal-500" style={{ width: "85%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">부담도</span>
                  <span className="text-sm font-semibold text-amber-400">62%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: "62%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">진심 전달</span>
                  <span className="text-sm font-semibold text-rose-400">40%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-rose-500" style={{ width: "40%" }} />
                </div>
              </div>
            </div>
            <div className="mt-5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/30">
              <p className="text-xs text-amber-300 leading-relaxed">
                형식적으로 들릴 수 있어요. &ldquo;말씀해 주셔서 감사합니다&rdquo;를 앞에 붙이면 진심이 더 전달됩니다.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            맞춤법, 톤, 상대방 인상까지 — 보내기 전 마지막 체크
          </p>
        </div>
      </section>

      {/* 요금제 */}
      <section id="pricing" className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            요금제
          </h2>
          <p className="text-center text-slate-400 mb-4">
            지금은 무료로 월 10크레딧을 드려요
          </p>
          <p className="text-center text-xs text-amber-400/80 mb-14">
            유료 플랜은 결제 시스템 연동 후 순차 출시 예정 — 1회 이용 시 3크레딧 차감
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
              <p className="text-sm font-semibold text-slate-400 mb-2">Free</p>
              <p className="text-3xl font-bold text-white mb-1">0원<span className="text-sm font-normal text-slate-500">/월</span></p>
              <p className="text-xs text-slate-500 mb-5">현재 운영 중</p>
              <ul className="space-y-2 text-sm text-slate-400 flex-1">
                <li className="flex items-start gap-2"><CheckIcon />월 10크레딧 (3회 사용)</li>
                <li className="flex items-start gap-2"><CheckIcon />답장 만들기 · 검토 · 말하기</li>
                <li className="flex items-start gap-2"><CheckIcon />입력 500자</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
              <p className="text-sm font-semibold text-teal-400 mb-2">Plus</p>
              <p className="text-3xl font-bold text-white mb-1">3,900원<span className="text-sm font-normal text-slate-500">/월</span></p>
              <p className="text-xs text-amber-400/80 mb-5">출시 예정</p>
              <ul className="space-y-2 text-sm text-slate-400 flex-1">
                <li className="flex items-start gap-2"><CheckIcon />월 70크레딧 (23회 사용)</li>
                <li className="flex items-start gap-2"><CheckIcon />입력 800자로 확장</li>
                <li className="flex items-start gap-2"><CheckIcon />내 말투 저장 50건 (출시 예정)</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-teal-950/30 border border-teal-700/60 flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">추천</span>
              <p className="text-sm font-semibold text-teal-400 mb-2">Pro</p>
              <p className="text-3xl font-bold text-white mb-1">8,900원<span className="text-sm font-normal text-slate-500">/월</span></p>
              <p className="text-xs text-amber-400/80 mb-5">출시 예정</p>
              <ul className="space-y-2 text-sm text-slate-300 flex-1">
                <li className="flex items-start gap-2"><CheckIcon />월 140크레딧 (46회 사용)</li>
                <li className="flex items-start gap-2"><CheckIcon />Sonnet 고품질 AI</li>
                <li className="flex items-start gap-2"><CheckIcon />입력 1,200자</li>
                <li className="flex items-start gap-2"><CheckIcon />내 말투 저장 무제한 (출시 예정)</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/60 flex flex-col">
              <p className="text-sm font-semibold text-violet-400 mb-2">Max</p>
              <p className="text-3xl font-bold text-white mb-1">19,800원<span className="text-sm font-normal text-slate-500">/월</span></p>
              <p className="text-xs text-amber-400/80 mb-5">출시 예정</p>
              <ul className="space-y-2 text-sm text-slate-400 flex-1">
                <li className="flex items-start gap-2"><CheckIcon />월 320크레딧 (106회 사용)</li>
                <li className="flex items-start gap-2"><CheckIcon />Pro의 모든 기능</li>
                <li className="flex items-start gap-2"><CheckIcon />맞춤 키워드 버튼 등록 (Max 전용)</li>
                <li className="flex items-start gap-2"><CheckIcon />우선 고객 지원</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">
            모든 플랜: 월 자동 갱신 · 언제든 해지 가능 · 결제 7일 이내 미사용 시 전액 환불 · 자세한 내용은{" "}
            <Link href="/refund" className="text-teal-400 hover:text-teal-300 underline">환불 정책</Link>
            {" "}참고
          </p>
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="px-4 py-24 text-center border-t border-slate-800/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">지금 바로 답장 만들어 보세요</h2>
          <p className="text-slate-400 mb-8">가입 없이 무료로 시작 — 5초면 첫 답장 완성</p>
          <Link
            href="/app"
            className="inline-block px-8 py-3.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
          >
            답장 만들러 가기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="px-4 py-8 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
                <ChatIcon size={10} />
              </div>
              <span className="text-sm font-semibold text-slate-400">리플라이</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">이용약관</Link>
              <span className="text-slate-700">|</span>
              <Link href="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">개인정보 처리방침</Link>
              <span className="text-slate-700">|</span>
              <Link href="/refund" className="text-slate-500 hover:text-slate-300 transition-colors">환불 정책</Link>
              <span className="text-slate-700">|</span>
              <Link href="/blog" className="text-slate-500 hover:text-slate-300 transition-colors">블로그</Link>
              <span className="text-slate-700">|</span>
              <a href="mailto:mazingha@kakao.com" className="text-slate-500 hover:text-slate-300 transition-colors">문의하기</a>
            </div>
          </div>
          <div className="text-center sm:text-left text-[11px] text-slate-600 leading-relaxed">
            <p>끌랑(CLang) | 대표: 석광원 | 사업자등록번호: 737-69-00453 | 통신판매업: 제 2026-충북증평-0008 호</p>
            <p>충북 증평군 증평읍 역전로 90, 1402호 | 전화: 070-8970-9571 | 이메일: mazingha@kakao.com</p>
          </div>
          <p className="text-center sm:text-left text-[11px] text-slate-700">&copy; 2026 Kevin AI Corp &middot; v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
        </div>
      </footer>
    </main>
  );
}
