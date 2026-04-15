export default function FeaturesSection() {
  return (
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
  );
}
