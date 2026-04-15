import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "결제 결과 — 리플라이",
  description: "카카오페이 결제 결과 안내",
};

type Status = "success" | "fail" | "cancel";

interface SearchParams {
  status?: string;
  reason?: string;
  amount?: string;
}

function normalizeStatus(raw: string | undefined): Status {
  if (raw === "success" || raw === "fail" || raw === "cancel") return raw;
  return "fail";
}

function reasonText(reason: string | undefined): string {
  switch (reason) {
    case "no_token":
      return "결제 토큰이 없습니다.";
    case "config":
      return "결제 시스템 설정이 완료되지 않았습니다.";
    case "session_expired":
      return "결제 세션이 만료되었습니다. 다시 시도해 주세요.";
    case "approve_failed":
      return "카카오페이 승인이 실패했습니다.";
    default:
      return "결제가 완료되지 않았습니다.";
  }
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const amount = params.amount ? Number(params.amount) : null;
  const reason = params.reason;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          {status === "success" && (
            <>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-teal-950/50 border border-teal-700/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">결제가 완료되었어요</h1>
              {amount !== null && (
                <p className="text-sm text-slate-400 mb-2">
                  결제 금액 <span className="text-white font-semibold">{amount.toLocaleString()}원</span>
                </p>
              )}
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                플랜 활성화는 영업일 기준 1일 이내 반영됩니다.
                <br />
                문의: <a href="mailto:mazingha@kakao.com" className="text-teal-400 hover:underline">mazingha@kakao.com</a>
              </p>
              <Link
                href="/app"
                className="inline-block px-8 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
              >
                앱으로 이동
              </Link>
            </>
          )}

          {status === "fail" && (
            <>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-rose-950/50 border border-rose-800/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">결제에 실패했어요</h1>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                {reasonText(reason)}
                <br />
                문제가 반복되면 <a href="mailto:mazingha@kakao.com" className="text-teal-400 hover:underline">mazingha@kakao.com</a>으로 연락 주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/#pricing"
                  className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
                >
                  다시 시도하기
                </Link>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all"
                >
                  홈으로
                </Link>
              </div>
            </>
          )}

          {status === "cancel" && (
            <>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-amber-950/50 border border-amber-800/60 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">결제가 취소되었어요</h1>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                언제든 다시 시도하실 수 있어요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/#pricing"
                  className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-all"
                >
                  요금제 다시 보기
                </Link>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all"
                >
                  홈으로
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
