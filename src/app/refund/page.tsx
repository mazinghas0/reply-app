import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환불 정책 — 리플라이",
  description: "리플라이 유료 구독 환불 정책 및 청약철회 규정",
};

export default function RefundPage() {
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
          <Link
            href="/#pricing"
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600/90 text-white hover:bg-teal-500 transition-colors"
          >
            요금제 보기
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">환불 정책</h1>
        <p className="text-sm text-slate-500 mb-10">시행일: 2026년 4월 10일</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <Section title="제1조 (목적)">
            <p>
              본 환불 정책은 끌랑(CLang)(이하 &ldquo;회사&rdquo;)이 제공하는 리플라이 서비스(이하 &ldquo;서비스&rdquo;)의
              유료 구독 상품 결제, 청약철회, 환불 및 해지에 관한 규정을 정함을 목적으로 합니다.
              본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업진흥법」을 준수합니다.
            </p>
          </Section>

          <Section title="제2조 (유료 상품의 구성)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 월 정기결제 방식의 구독 상품을 제공하며, 구독 상품별 월간 크레딧과 이용 가능 기능이 차등
                제공됩니다. 세부 내역은 서비스 내 요금제 안내 페이지에 표시됩니다.
              </li>
              <li>
                크레딧은 서비스 내 답장 생성 기능에만 사용되는 비환금성 디지털 이용권이며, 현금, 상품, 포인트,
                타 서비스로 환전하거나 양도할 수 없습니다.
              </li>
              <li>
                구독은 결제일로부터 1개월간 유효하며, 해지하지 않는 경우 동일한 조건으로 자동 갱신됩니다.
              </li>
            </ol>
          </Section>

          <Section title="제3조 (청약철회 및 전액 환불)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                이용자는 결제일로부터 <strong className="text-white">7일 이내</strong>에, 해당 결제 주기에 지급된
                크레딧을 <strong className="text-white">1회도 사용하지 않은 경우</strong>에 한하여 청약철회를 요청할
                수 있으며, 이 경우 결제 금액 전액이 환불됩니다.
              </li>
              <li>
                청약철회 요청은 서비스 내 설정 &gt; 구독 관리 메뉴 또는 고객센터 이메일(mazingha@kakao.com)을
                통해 접수할 수 있습니다.
              </li>
              <li>
                회사는 청약철회 요청 접수일로부터 영업일 기준 3일 이내에 환불 처리를 진행하며, 카드 결제의 경우
                카드사 정책에 따라 실제 환급까지 3~5영업일이 추가 소요될 수 있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제4조 (청약철회가 제한되는 경우)">
            <p className="mb-3">
              「전자상거래법 제17조 제2항」 및 「콘텐츠산업진흥법 제27조」에 따라 다음의 경우 청약철회가 제한될
              수 있습니다.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                해당 결제 주기에 지급된 크레딧을 <strong className="text-white">1회 이상 사용</strong>한 경우. 단,
                회사의 귀책 사유로 서비스가 정상 제공되지 않은 경우는 예외로 합니다.
              </li>
              <li>결제일로부터 7일이 경과한 경우 (단, 제5조의 월 중도 해지는 별도 적용)</li>
              <li>이용자의 고의 또는 과실로 서비스 이용 약관을 위반하여 이용이 제한된 경우</li>
            </ol>
          </Section>

          <Section title="제5조 (월 중도 해지 및 부분 환불)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                이용자는 언제든지 서비스 내 설정 &gt; 구독 관리 메뉴에서 해지를 요청할 수 있습니다.
              </li>
              <li>
                해지 요청 시 다음 결제일부터 자동 청구가 중단되며, 이미 결제한 당월 구독 기간은 그대로 이용이
                가능합니다. 월 중도 해지의 경우 일할 계산에 의한 부분 환불은 제공되지 않습니다.
              </li>
              <li>
                단, 회사의 귀책 사유(서비스 중단, 기능 장애 등)로 서비스를 제공받지 못한 경우에는 해당 기간에
                대하여 일할 계산으로 환불합니다.
              </li>
            </ol>
          </Section>

          <Section title="제6조 (자동 갱신 실패 시 처리)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                정기결제 갱신일에 결제가 실패한 경우, 회사는 이메일 또는 서비스 내 알림으로 이용자에게 안내합니다.
              </li>
              <li>
                결제 실패 후 3일 이내에 결제가 재개되지 않으면 구독은 자동으로 해지되며, 이용자 계정은 무료(Free)
                플랜으로 전환됩니다.
              </li>
            </ol>
          </Section>

          <Section title="제7조 (결제 수단별 환불 처리)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong className="text-white">신용카드 결제</strong>: 카드 결제 취소 방식으로 환불되며, 카드사
                승인 취소 일정에 따라 실제 환급 시점이 달라질 수 있습니다.
              </li>
              <li>
                <strong className="text-white">간편결제 (카카오페이 등)</strong>: 해당 간편결제 서비스의 환불 정책에
                따라 처리되며, 통상 영업일 기준 1~5일 이내에 환급됩니다.
              </li>
            </ol>
          </Section>

          <Section title="제8조 (환불 요청 방법)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong className="text-white">앱 내 요청</strong>: 서비스 로그인 &gt; 설정 &gt; 구독 관리 &gt; 환불 요청
              </li>
              <li>
                <strong className="text-white">이메일 요청</strong>: mazingha@kakao.com 으로 결제일, 결제 금액, 환불
                사유를 기재하여 발송
              </li>
              <li>
                환불 요청은 결제자 본인의 명의로만 접수 가능하며, 회사는 본인 확인을 위해 추가 정보를 요청할 수
                있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제9조 (문의처)">
            <div className="space-y-1 text-slate-300">
              <p>상호: 끌랑(CLang)</p>
              <p>대표: 석광원</p>
              <p>사업자등록번호: 737-69-00453</p>
              <p>통신판매업 신고번호: 제 2026-충북증평-0008 호</p>
              <p>소재지: 충북 증평군 증평읍 역전로 90, 1402호</p>
              <p>전화: 070-8970-9571</p>
              <p>이메일: mazingha@kakao.com</p>
            </div>
          </Section>

          <div className="pt-6 border-t border-slate-800/50 text-xs text-slate-500">
            <p>본 환불 정책은 2026년 4월 10일부터 시행합니다.</p>
            <p className="text-slate-500 mt-1">
              정책 변경 시 서비스 내 공지사항을 통해 사전 안내합니다.
            </p>
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
