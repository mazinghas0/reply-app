import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 — 리플라이",
  description: "리플라이 서비스 개인정보 처리방침",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-white mb-2">개인정보 처리방침</h1>
        <p className="text-sm text-slate-500 mb-10">시행일: 2026년 4월 9일</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <p className="text-slate-400">
            Kevin AI Corp(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관련 법령에 따라
            이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하게 처리하기 위해
            다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <Section title="1. 개인정보의 수집 및 이용 목적">
            <p>회사는 다음의 목적으로 개인정보를 수집·이용합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>회원가입 및 본인 확인</li>
              <li>서비스 제공 (AI 답장 생성, 검토, 다듬기)</li>
              <li>크레딧 관리 및 사용량 제한</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>고객 문의 대응</li>
            </ul>
          </Section>

          <Section title="2. 수집하는 개인정보 항목">
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-4 text-slate-400 font-medium">구분</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-medium">수집 항목</th>
                    <th className="text-left py-2 text-slate-400 font-medium">수집 방법</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">회원가입</td>
                    <td className="py-2.5 pr-4">이메일, 이름, 프로필 이미지</td>
                    <td className="py-2.5">Clerk 인증 (Google/이메일)</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">서비스 이용</td>
                    <td className="py-2.5 pr-4">입력 메시지 (일시적 처리, 미저장)</td>
                    <td className="py-2.5">서비스 이용 과정</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">사용량 관리</td>
                    <td className="py-2.5 pr-4">IP 주소, 이용자 ID, 크레딧 잔액</td>
                    <td className="py-2.5">자동 수집</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">자동 수집</td>
                    <td className="py-2.5 pr-4">접속 로그, 브라우저 정보, 쿠키</td>
                    <td className="py-2.5">서비스 접속 시 자동</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. 개인정보의 보유 및 이용 기간">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회원 탈퇴 시 즉시 파기를 원칙으로 합니다.</li>
              <li>단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                  <li>전자상거래 등에서의 소비자 보호에 관한 법률: 계약·청약철회 기록 5년, 대금결제 기록 5년, 소비자 불만 처리 기록 3년</li>
                  <li>통신비밀보호법: 접속 로그 3개월</li>
                </ul>
              </li>
              <li>입력 메시지는 AI 답장 생성 후 즉시 삭제되며, 서버에 저장하지 않습니다.</li>
            </ol>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            <p>
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.
            </p>
          </Section>

          <Section title="5. 개인정보 처리 위탁 및 국외 이전">
            <p className="mb-3">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-4 text-slate-400 font-medium">수탁업체</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-medium">위탁 업무</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-medium">이전 국가</th>
                    <th className="text-left py-2 text-slate-400 font-medium">이전 항목</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">Anthropic, PBC</td>
                    <td className="py-2.5 pr-4">AI 답장 생성 (Claude API)</td>
                    <td className="py-2.5 pr-4">미국</td>
                    <td className="py-2.5">입력 메시지 (처리 후 즉시 삭제)</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">Clerk, Inc.</td>
                    <td className="py-2.5 pr-4">회원 인증 및 관리</td>
                    <td className="py-2.5 pr-4">미국</td>
                    <td className="py-2.5">이메일, 이름, 프로필</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">Supabase, Inc.</td>
                    <td className="py-2.5 pr-4">크레딧 및 데이터 저장</td>
                    <td className="py-2.5 pr-4">미국</td>
                    <td className="py-2.5">이용자 ID, 크레딧 잔액, 추천 코드</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">Upstash, Inc.</td>
                    <td className="py-2.5 pr-4">비회원 사용량 제한</td>
                    <td className="py-2.5 pr-4">미국</td>
                    <td className="py-2.5">IP 주소, 요청 횟수</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2.5 pr-4">Vercel, Inc.</td>
                    <td className="py-2.5 pr-4">웹사이트 호스팅</td>
                    <td className="py-2.5 pr-4">미국</td>
                    <td className="py-2.5">접속 로그, 쿠키</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-400">
              각 수탁업체는 해당 업무 수행 목적 범위 내에서만 개인정보를 처리하며,
              위탁 계약 시 개인정보 보호 관련 법규 준수, 비밀 유지, 재위탁 제한 등을 명시하고 있습니다.
            </p>
          </Section>

          <Section title="6. 개인정보의 파기 절차 및 방법">
            <ol className="list-decimal pl-5 space-y-2">
              <li>파기 절차: 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.</li>
              <li>파기 방법: 전자적 파일은 복구 불가능한 방법으로 삭제하고, 서면 자료는 분쇄 또는 소각합니다.</li>
            </ol>
          </Section>

          <Section title="7. 이용자의 권리와 행사 방법">
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.</li>
              <li>요청은 이메일(help@kevinai.co.kr)로 접수하며, 10일 이내에 처리합니다.</li>
              <li>회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="8. 쿠키의 사용">
            <ol className="list-decimal pl-5 space-y-2">
              <li>회사는 서비스 이용 편의를 위해 쿠키를 사용합니다.</li>
              <li>쿠키는 로그인 상태 유지, 테마 설정 저장, 온보딩 표시 여부 등에 활용됩니다.</li>
              <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="9. 개인정보의 기술적·관리적 보호 대책">
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>HTTPS 암호화 통신 적용</li>
              <li>인증 토큰 기반 접근 제어 (Clerk)</li>
              <li>API 요청 시 Origin 검증</li>
              <li>사용량 제한을 통한 서비스 남용 방지</li>
              <li>개인정보 접근 최소화 원칙 적용</li>
            </ul>
          </Section>

          <Section title="10. 개인정보 보호책임자">
            <ul className="space-y-1 text-slate-400 mt-2">
              <li>회사명: Kevin AI Corp</li>
              <li>이메일: help@kevinai.co.kr</li>
            </ul>
            <p className="mt-3 text-slate-400">
              기타 개인정보 침해에 대한 신고나 상담은 아래 기관에 문의하시기 바랍니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500">
              <li>개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
              <li>대검찰청 사이버범죄수사단 (www.spo.go.kr / 02-3480-3571)</li>
              <li>경찰청 사이버안전국 (ecrm.police.go.kr / 182)</li>
            </ul>
          </Section>

          <Section title="11. 고지의 의무">
            <p>
              본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경이 있을 경우
              시행 7일 전에 서비스 내 공지를 통해 고지합니다.
            </p>
          </Section>

          <div className="pt-6 border-t border-slate-800/50">
            <p className="text-slate-500">시행일자: 2026년 4월 9일</p>
          </div>
        </div>
      </article>

      {/* 푸터 */}
      <footer className="px-4 py-8 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            &larr; 홈으로
          </Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            이용약관 &rarr;
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
