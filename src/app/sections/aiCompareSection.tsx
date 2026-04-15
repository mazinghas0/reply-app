import { CheckIcon } from "./icons";

export default function AiCompareSection() {
  return (
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
  );
}
