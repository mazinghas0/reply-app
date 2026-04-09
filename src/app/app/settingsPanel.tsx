"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("reply-theme", next ? "dark" : "light");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">설정</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-6">
          {/* 화면 설정 */}
          <SettingsGroup label="화면 설정">
            <ToggleRow
              title="다크 모드"
              description={dark ? "어두운 배경으로 눈의 피로를 줄입니다" : "밝은 배경으로 전환합니다"}
              checked={dark}
              onChange={toggleTheme}
            />
          </SettingsGroup>

          {/* 법적 문서 */}
          <SettingsGroup label="약관 및 정책">
            <LinkRow href="/terms" title="이용약관" />
            <LinkRow href="/privacy" title="개인정보 처리방침" />
          </SettingsGroup>

          {/* 지원 */}
          <SettingsGroup label="지원">
            <LinkRow href="mailto:mazingha@kakao.com" title="문의하기" description="mazingha@kakao.com" external />
          </SettingsGroup>

          {/* 사업자 정보 */}
          <SettingsGroup label="사업자 정보">
            <InfoRow label="상호" value="끌랑(CLang)" />
            <InfoRow label="브랜드" value="Kevin AI Corp" />
            <InfoRow label="대표" value="석광원" />
            <InfoRow label="사업자등록번호" value="737-69-00453" />
            <InfoRow label="소재지" value="충북 증평군 증평읍 역전로 90, 1402호" />
            <InfoRow label="이메일" value="mazingha@kakao.com" />
          </SettingsGroup>

          {/* 앱 정보 */}
          <SettingsGroup label="앱 정보">
            <InfoRow label="버전" value={process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"} />
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
}

/* ── 하위 컴포넌트 ────────────────────────────── */

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2">{label}</p>
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/50">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function LinkRow({
  href,
  title,
  description,
  external,
}: {
  href: string;
  title: string;
  description?: string;
  external?: boolean;
}) {
  const inner = (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }

  return <Link href={href}>{inner}</Link>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-300 text-right">{value}</span>
    </div>
  );
}
