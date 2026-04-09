import Link from "next/link";
import type { Metadata } from "next";
import HeroDemo from "./heroDemo";
import LandingAuth from "./landingAuth";
import TrialButton from "./trialButton";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "리플라이 — AI가 답장을 대신 써 드려요",
  description:
    "받은 메시지를 붙여넣으면 AI가 톤에 맞는 답장 3개를 즉시 만들어 줍니다. 비즈니스 메시지도 10초면 끝. 무료로 시작하세요.",
  keywords: [
    "AI 답장",
    "답장 생성",
    "메시지 답장",
    "카톡 답장",
    "비즈니스 메시지",
    "답장 도우미",
    "AI 메신저",
    "거절 답장",
    "답장 추천",
  ],
  openGraph: {
    title: "리플라이 — AI 답장 도우미",
    description:
      "받은 메시지를 붙여넣으면 AI가 톤에 맞는 답장 3개를 즉시 만들어 줍니다. 정중한, 단호한, 유연한, 친근한 — 원하는 톤으로.",
    type: "website",
    url: "https://reply-app-sepia.vercel.app",
    siteName: "리플라이",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "리플라이 — AI가 답장을 대신 써 드려요",
    description: "받은 메시지 붙여넣기 한 번이면 답장 3개 완성. 무료.",
  },
  alternates: {
    canonical: "https://reply-app-sepia.vercel.app",
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
    solution: "대충 쓴 문장을 넣고 '정중' 톤으로 다듬으면 예의 바른 메일이 완성돼요.",
    feature: "다듬기",
  },
  {
    emoji: "heart",
    who: "썸 타는 사람",
    situation: "답장이 너무 가벼워도, 무거워도 안 되는 미묘한 상황",
    solution: "답장을 만들고 '더 부드럽게' '더 짧게'로 강도를 조절할 수 있어요.",
    feature: "답장 확장",
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
            AI 답장 도우미
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            받은 메시지,{" "}
            <span className="text-teal-400">AI가 대신</span>{" "}
            답장해 드려요
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            톤을 고르면 AI가 3가지 답장을 즉시 만들어 줍니다.
            <br className="hidden sm:block" />
            비즈니스 메시지도 10초면 끝.
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

      {/* ChatGPT와 다른 점 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-4">
            &ldquo;ChatGPT에 시키면 되지 않나요?&rdquo;
          </h2>
          <p className="text-center text-slate-400 mb-14">
            범용 AI와 답장 전용 도구는 다릅니다
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-sm font-semibold text-slate-500 mb-4">ChatGPT / 범용 AI</p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  프롬프트를 직접 작성해야 함
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  답장이 교과서체 &middot; 번역체
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  관계 &middot; 상황 맥락 매번 설명
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0 mt-0.5">-</span>
                  결과를 직접 복사 &middot; 붙여넣기
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
          <div className="grid sm:grid-cols-2 gap-4">
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
                상사, 동료, 거래처, 친구, 연인까지. 관계를 고르면 격식과 뉘앙스를 자동으로 맞춰 줍니다.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-violet-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">검토 & 다듬기</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                내가 쓴 답장의 맞춤법, 톤, 상대방 인상까지 분석. 대충 쓴 문장도 깔끔하게 다듬어 줍니다.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">내 말투 학습</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                답장을 수정할수록 AI가 내 문체를 학습합니다. 쓸수록 더 나다워지는 답장을 경험하세요.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              지금은 완전 무료 — 가입만 하면 월 30크레딧
            </p>
          </div>
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="px-4 py-24 text-center border-t border-slate-800/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">답장 고민, 이제 그만</h2>
          <p className="text-slate-400 mb-8">AI가 만든 답장으로 시간을 절약하세요</p>
          <Link
            href="/app"
            className="inline-block px-8 py-3.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
          >
            지금 바로 시작하기
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
