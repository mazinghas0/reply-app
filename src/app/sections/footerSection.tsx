import Link from "next/link";
import { ChatIcon } from "./icons";

export default function FooterSection() {
  return (
    <footer className="px-4 py-8 border-t border-slate-800/50">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center">
              <ChatIcon size={10} />
            </div>
            <span className="text-sm font-semibold text-slate-400">리플라이</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">이용약관</Link>
            <span className="text-slate-700">|</span>
            <Link href="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">개인정보 처리방침</Link>
            <span className="text-slate-700">|</span>
            <Link href="/refund" className="text-slate-500 hover:text-slate-300 transition-colors">환불 정책</Link>
            <span className="text-slate-700">|</span>
            <Link href="/blog" className="text-slate-500 hover:text-slate-300 transition-colors">블로그</Link>
            <span className="text-slate-700">|</span>
            <a href="mailto:mazingha@kakao.com" className="text-slate-500 hover:text-slate-300 transition-colors">문의하기</a>
          </div>
        </div>
        <div className="text-center sm:text-left text-[11px] text-slate-600 leading-relaxed">
          <p>끌랑(CLang) | 대표: 석광원 | 사업자등록번호: 737-69-00453 | 통신판매업: 제 2026-충북증평-0008 호</p>
          <p>충북 증평군 증평읍 역전로 90, 1402호 | 전화: 070-8970-9571 | 이메일: mazingha@kakao.com</p>
        </div>
        <p className="text-center sm:text-left text-[11px] text-slate-700">&copy; 2026 Kevin AI Corp &middot; v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
      </div>
    </footer>
  );
}
