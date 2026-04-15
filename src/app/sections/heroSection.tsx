import Link from "next/link";
import HeroDemo from "../heroDemo";
import TrialButton from "../trialButton";

export default function HeroSection() {
  return (
    <section className="relative px-4 pt-24 pb-20 overflow-hidden">
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
  );
}
