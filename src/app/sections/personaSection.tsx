import { PersonaIcon } from "./icons";

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
    solution: "하고 싶은 말을 넣고 '정중' 톤을 고르면 예의 바른 메일이 완성돼요.",
    feature: "말하기",
  },
  {
    emoji: "heart",
    who: "썸 타는 사람",
    situation: "답장이 너무 가벼워도, 무거워도 안 되는 미묘한 상황",
    solution: "답장을 만들고 '더 부드럽게' '더 짧게'로 강도를 조절할 수 있어요.",
    feature: "답장 확장",
  },
  {
    emoji: "family-heart",
    who: "청소년 자녀 부모",
    situation: "사춘기 딸한테서 '아빠 짜증나' — 혼낼 수도, 그냥 넘길 수도 없을 때",
    solution: "관계를 '가족'으로, 상황을 '위로'나 '격려'로 고르면 아이 마음에 닿는 말투로 바꿔줘요.",
    feature: "가족 대화",
  },
];

export default function PersonaSection() {
  return (
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
  );
}
