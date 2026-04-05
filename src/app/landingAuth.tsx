"use client";

import Link from "next/link";

export default function LandingAuth() {
  return (
    <Link
      href="/sign-in"
      className="text-sm font-medium px-4 py-2 text-slate-400 hover:text-white transition-colors"
    >
      로그인
    </Link>
  );
}
