import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 리플라이",
  description: "리플라이 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
      {/* 헤더 */}
      <header className="px-4 py-6 border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-400">리플라이</span>
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">서비스 이용약관</h1>
        <p className="text-sm text-slate-500 mb-10">시행일: 2026년 4월 9일</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <Section title="제1조 (목적)">
            <p>
              본 약관은 끌랑(CLang)(이하 &ldquo;회사&rdquo;)이 제공하는 리플라이 서비스(이하 &ldquo;서비스&rdquo;)의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>&ldquo;서비스&rdquo;란 회사가 제공하는 AI 기반 메시지 답장 생성, 답장 검토, 답장 다듬기 등의 기능을 말합니다.</li>
              <li>&ldquo;이용자&rdquo;란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
              <li>&ldquo;회원&rdquo;이란 서비스에 로그인하여 회원 자격을 취득한 이용자를 말합니다.</li>
              <li>&ldquo;크레딧&rdquo;이란 서비스 이용 시 차감되는 가상의 이용 단위를 말합니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.</li>
              <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (서비스의 제공)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                  <li>AI 기반 메시지 답장 생성 (톤, 관계, 전략 맞춤)</li>
                  <li>답장 검토 (맞춤법, 톤 분석, 상대방 인상 예측)</li>
                  <li>답장 다듬기 (톤별 문장 리팩토링)</li>
                  <li>답장 히스토리 관리</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등 필요한 경우 일시 중단할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제5조 (이용 요금 및 크레딧)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스의 기본 이용은 무료이며, 크레딧 시스템에 따라 이용량이 제한됩니다.</li>
              <li>회원은 매월 50크레딧을 무료로 제공받으며, 매월 1일에 자동으로 리셋됩니다.</li>
              <li>비회원은 일 3회 무료 이용이 가능합니다.</li>
              <li>추천 코드를 통해 추가 크레딧을 획득할 수 있습니다.</li>
              <li>유료 요금제(프로 플랜)는 추후 별도 공지를 통해 안내합니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (회원가입 및 탈퇴)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자는 회사가 정한 방법(Google 로그인 또는 이메일 인증)에 따라 회원가입을 신청합니다.</li>
              <li>회원은 언제든지 서비스 내에서 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</li>
              <li>탈퇴 시 회원의 크레딧 잔액 및 히스토리 데이터는 삭제됩니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (이용자의 의무)">
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>타인의 개인정보를 도용하여 서비스를 이용하는 행위</li>
              <li>서비스를 이용하여 불법적인 목적의 메시지를 생성하는 행위</li>
              <li>자동화된 수단(봇, 스크래핑 등)으로 서비스에 접근하는 행위</li>
              <li>서비스의 운영을 방해하거나 시스템에 부하를 가하는 행위</li>
              <li>기타 관련 법령 및 본 약관에 위배되는 행위</li>
            </ul>
          </Section>

          <Section title="제8조 (AI 생성 콘텐츠에 대한 면책)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스가 생성하는 답장은 AI 모델에 의해 자동 생성된 것이며, 회사는 생성된 내용의 정확성, 적절성, 완전성을 보장하지 않습니다.</li>
              <li>이용자가 AI 생성 답장을 사용하여 발생하는 결과에 대한 책임은 이용자에게 있습니다.</li>
              <li>회사는 이용자가 입력한 메시지 내용을 AI 답장 생성 목적으로만 사용하며, 별도로 저장하거나 학습에 활용하지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제9조 (지적재산권)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스의 디자인, 소프트웨어, 상표 등 지적재산권은 회사에 귀속됩니다.</li>
              <li>AI가 생성한 답장의 저작권은 이용자에게 귀속되며, 이용자는 이를 자유롭게 사용할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제10조 (서비스 이용 제한)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 이용자가 본 약관을 위반한 경우 서비스 이용을 제한하거나 회원 자격을 정지할 수 있습니다.</li>
              <li>회사는 서비스 남용(비정상적인 대량 요청 등)이 감지된 경우 이용을 제한할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제11조 (면책사항)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
              <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              <li>회사는 무료로 제공하는 서비스와 관련하여 이용자에게 발생한 손해에 대해 책임을 지지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제12조 (분쟁 해결)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 성실히 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않은 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.</li>
              <li>본 약관에 명시되지 않은 사항은 대한민국 관련 법령에 따릅니다.</li>
            </ol>
          </Section>

          <div className="pt-6 border-t border-slate-800/50">
            <p className="text-slate-500">부칙</p>
            <p className="text-slate-500 mt-1">본 약관은 2026년 4월 9일부터 시행합니다.</p>
          </div>
        </div>
      </article>

      {/* 푸터 */}
      <footer className="px-4 py-8 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            &larr; 홈으로
          </Link>
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            개인정보 처리방침 &rarr;
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      <div className="text-slate-300">{children}</div>
    </section>
  );
}
