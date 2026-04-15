import Link from "next/link";

export default function CtaSection() {
  return (
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
  );
}
