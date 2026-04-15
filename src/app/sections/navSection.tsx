import Link from "next/link";
import LandingAuth from "../landingAuth";
import { ChatIcon } from "./icons";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function NavSection() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
            <ChatIcon size={14} />
          </div>
          <span className="font-bold text-lg text-white">리플라이</span>
        </div>
        <div className="flex items-center gap-3">
          {clerkEnabled && <LandingAuth />}
          <Link
            href="/app"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all"
          >
            시작하기
          </Link>
        </div>
      </div>
    </nav>
  );
}
