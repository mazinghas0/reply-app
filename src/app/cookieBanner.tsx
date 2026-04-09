"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("reply-cookie-consent")) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    localStorage.setItem("reply-cookie-consent", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-3 animate-fade-in-up">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          리플라이는 서비스 제공을 위해 쿠키를 사용합니다.{" "}
          <Link href="/privacy" className="text-teal-400 hover:text-teal-300 underline">
            개인정보 처리방침
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-500 transition-colors cursor-pointer"
        >
          확인
        </button>
      </div>
    </div>
  );
}
