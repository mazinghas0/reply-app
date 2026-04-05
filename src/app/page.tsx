import Link from "next/link";
import type { Metadata } from "next";
import { SignInButton } from "@clerk/nextjs";

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

const STEPS = [
  {
    number: "1",
    title: "메시지 붙여넣기",
    desc: "답장하고 싶은 메시지를 복사해서 붙여넣으세요",
  },
  {
    number: "2",
    title: "톤 선택",
    desc: "정중 · 단호 · 유연 · 친근 중 원하는 톤을 고르세요",
  },
  {
    number: "3",
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

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-indigo-500 shrink-0"
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
      className="w-4 h-4 text-gray-400 shrink-0"
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

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <ChatIcon size={14} />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              리플라이
            </span>
          </div>
          <div className="flex items-center gap-3">
            {clerkEnabled && (
              <SignInButton mode="modal">
                <button className="text-sm font-medium px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  로그인
                </button>
              </SignInButton>
            )}
            <Link
              href="/app"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-20 pb-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium mb-6">
            AI 답장 도우미
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
            받은 메시지,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AI가 대신
            </span>{" "}
            답장해 드려요
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            톤을 고르면 AI가 3가지 답장을 즉시 만들어 줍니다.
            <br className="hidden sm:block" />
            비즈니스 메시지도 10초면 끝.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-violet-700 transition-all text-center"
            >
              무료로 시작하기
            </Link>
            <p className="text-sm text-gray-400">가입 없이 바로 사용</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 bg-white/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            3단계로 끝나는 답장
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            왜 리플라이인가요?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 bg-white/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            심플한 요금제
          </h2>
          <p className="text-center text-gray-500 mb-10">
            지금은 완전 무료. 마음껏 사용해 보세요.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm relative">
              <div className="absolute -top-3 left-6">
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white font-medium">
                  현재
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">무료</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                0
                <span className="text-base font-normal text-gray-400">
                  원/월
                </span>
              </p>
              <ul className="space-y-2.5 text-sm text-gray-600">
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
                className="block mt-6 w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm"
              >
                시작하기
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium mb-2">
                출시 예정
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">프로</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                9,900
                <span className="text-base font-normal text-gray-400">
                  원/월
                </span>
              </p>
              <ul className="space-y-2.5 text-sm text-gray-500">
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
              <div className="mt-6 w-full py-2.5 text-center rounded-xl bg-gray-200 text-gray-400 font-medium cursor-not-allowed">
                곧 출시
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            답장 고민, 이제 그만
          </h2>
          <p className="text-gray-500 mb-8">
            AI가 만든 답장으로 시간을 절약하세요
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
          >
            지금 바로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <ChatIcon size={10} />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              리플라이
            </span>
          </div>
          <p className="text-xs text-gray-400">Kevin AI Corp</p>
        </div>
      </footer>
    </main>
  );
}
