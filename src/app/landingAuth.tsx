"use client";

import { SignInButton } from "@clerk/nextjs";

export default function LandingAuth() {
  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium px-4 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
        로그인
      </button>
    </SignInButton>
  );
}
