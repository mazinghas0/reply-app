export default function BeforeAfterSection() {
  return (
    <section className="px-4 py-24 border-t border-slate-800/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-4">
          같은 상황, 다른 답장
        </h2>
        <p className="text-center text-slate-400 mb-14">
          리플라이를 쓰기 전과 후, 이렇게 달라져요
        </p>
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-800/60 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800/60">
              <p className="text-xs text-slate-500">상사가 주말 출근 요청 — 거절하고 싶을 때</p>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
              <div className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-3">내가 쓴 답장</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  &ldquo;이번 주말은 좀 힘들 것 같습니다...&rdquo;
                </p>
              </div>
              <div className="p-5 bg-teal-950/10">
                <p className="text-xs font-semibold text-teal-400 mb-3">리플라이 답장</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  &ldquo;팀장님, 이번 주말은 선약이 있어서 참석이 어려울 것 같습니다. 대신 월요일 오전에 미리 준비해두겠습니다.&rdquo;
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800/60 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800/60">
              <p className="text-xs text-slate-500">썸 상대가 &ldquo;요즘 바빠?&rdquo; — 관심 표현하고 싶을 때</p>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
              <div className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-3">내가 쓴 답장</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  &ldquo;아 ㅋㅋ 좀 바빴어~&rdquo;
                </p>
              </div>
              <div className="p-5 bg-teal-950/10">
                <p className="text-xs font-semibold text-teal-400 mb-3">리플라이 답장</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  &ldquo;요즘 진짜 정신없었어 ㅠ 그래도 연락 와서 반갑다! 이번 주 시간 되면 커피 한 잔 하자&rdquo;
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800/60 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800/60">
              <p className="text-xs text-slate-500">사춘기 딸이 &ldquo;아빠 짜증나&rdquo; — 다가가고 싶을 때</p>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
              <div className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-3">내가 쓴 답장</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  &ldquo;뭐가 짜증나? 무슨 일 있어?&rdquo;
                </p>
              </div>
              <div className="p-5 bg-teal-950/10">
                <p className="text-xs font-semibold text-teal-400 mb-3">리플라이 답장</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  &ldquo;그랬구나, 힘들었겠다. 얘기하고 싶으면 아빠 언제든 들을게. 안 하고 싶으면 그것도 괜찮아&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
