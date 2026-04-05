import Link from "next/link";
import type { Metadata } from "next";
import HeroDemo from "./heroDemo";
import LandingAuth from "./landingAuth";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "리플라이 — AI가 답장을 대신 써 드려요",
  description:
    "받은 메시지를 붙여넣으면 AI가 톤에 맞는 답장 3개를 즉시 만들어 줍니다. 비즈니스 메시지도 10초면 끝.",
  openGraph: {
    title: "리플라이 — AI 답장 도우미",
    description: "톤을 고르면 AI가 답장 3개를 즉시 만들어 줍니다",
    type: "website",
    url: "https://reply-app-sepia.vercel.app",
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

const FEATURES = [
  {
    title: "4가지 톤",
    desc: "정중 · 단호 · 유연 · 친근, 상황에 맞는 톤을 골라 답장하세요",
  },
  {
    title: "빠른 / 정교한 모드",
    desc: "일상 메시지는 빠르게, 중요한 메시지는 정교하게 생성",
  },
  {
    title: "답장 히스토리",
    desc: "최근 10개 답장 기록을 저장해 언제든 다시 볼 수 있어요",
  },
  {
    title: "한국어 최적화",
    desc: "한국어 비즈니스 표현에 특화된 AI가 자연스러운 답장을 생성",
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

function CheckIconMuted() {
  return (
    <svg
      className="w-4 h-4 text-slate-500 shrink-0"
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
            <p className="text-sm text-slate-500">가입 없이 바로 사용</p>
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

      {/* 기능 소개 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-16">
            왜 리플라이인가요?
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {FEATURES.map((f) => (
              <div key={f.title} className="pl-4 border-l-2 border-teal-500/40">
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요금제 */}
      <section className="px-4 py-24 border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-3">
            심플한 요금제
          </h2>
          <p className="text-center text-slate-400 mb-12">
            지금은 완전 무료. 마음껏 사용해 보세요.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* 무료 */}
            <div className="p-6 rounded-2xl bg-slate-900 border-2 border-teal-500/40 relative">
              <div className="absolute -top-3 left-6">
                <span className="text-xs px-3 py-1 rounded-full bg-teal-600 text-white font-medium">
                  현재
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">무료</h3>
              <p className="text-3xl font-bold text-white mb-4">
                0
                <span className="text-base font-normal text-slate-500">원/월</span>
              </p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  로그인 시 하루 10회 (비로그인 5회)
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  4가지 톤 선택
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  빠른 / 정교한 모드
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  답장 히스토리 10개
                </li>
              </ul>
              <Link
                href="/app"
                className="block mt-6 w-full py-2.5 text-center rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors"
              >
                시작하기
              </Link>
            </div>

            {/* 프로 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 font-medium mb-2">
                출시 예정
              </div>
              <h3 className="font-bold text-white text-lg mb-1">프로</h3>
              <p className="text-3xl font-bold text-white mb-4">
                9,900
                <span className="text-base font-normal text-slate-500">원/월</span>
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckIconMuted />
                  무제한 답장 생성
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconMuted />
                  우선 처리
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconMuted />
                  답장 히스토리 무제한
                </li>
                <li className="flex items-center gap-2">
                  <CheckIconMuted />
                  커스텀 톤 설정
                </li>
              </ul>
              <div className="mt-6 w-full py-2.5 text-center rounded-xl bg-slate-800 text-slate-500 font-medium cursor-not-allowed">
                곧 출시
              </div>
            </div>
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
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
              <ChatIcon size={10} />
            </div>
            <span className="text-sm font-semibold text-slate-400">리플라이</span>
          </div>
          <p className="text-xs text-slate-600">Kevin AI Corp</p>
        </div>
      </footer>
    </main>
  );
}
