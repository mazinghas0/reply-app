export default function ReviewSection() {
  return (
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
  );
}
