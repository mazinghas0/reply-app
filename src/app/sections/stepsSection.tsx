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

export default function StepsSection() {
  return (
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
  );
}
