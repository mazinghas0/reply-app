"use client";

import { useState, useEffect } from "react";
import { type AppMode, type ToneId, type Speed, TONES, SPEEDS } from "./shared";
import CustomKeywordSection from "./customKeywordSection";

type FontSize = "small" | "normal" | "large";

const FONT_SIZE_OPTIONS: Array<{ id: FontSize; label: string }> = [
  { id: "small", label: "작게" },
  { id: "normal", label: "보통" },
  { id: "large", label: "크게" },
];

const TAB_OPTIONS: Array<{ id: AppMode; label: string }> = [
  { id: "generate", label: "답장 만들기" },
  { id: "review", label: "답장 검토" },
  { id: "refine", label: "말하기" },
  { id: "archive", label: "기록" },
];

interface SettingsPanelProps {
  onClose: () => void;
  onResetTour: () => void;
  plan?: string | null;
}

export default function SettingsPanel({ onClose, onResetTour, plan }: SettingsPanelProps) {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [defaultTone, setDefaultTone] = useState<ToneId>("polite");
  const [defaultSpeed, setDefaultSpeed] = useState<Speed>("quality");
  const [defaultTab, setDefaultTab] = useState<AppMode>("generate");
  const [clipboardDetect, setClipboardDetect] = useState(true);
  const [styleCount, setStyleCount] = useState<number | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));

    const savedFontSize = localStorage.getItem("reply-font-size") as FontSize | null;
    if (savedFontSize && ["small", "normal", "large"].includes(savedFontSize)) setFontSize(savedFontSize);

    const savedTone = localStorage.getItem("reply-default-tone") as ToneId | null;
    if (savedTone && TONES.some((t) => t.id === savedTone)) setDefaultTone(savedTone);

    const savedSpeed = localStorage.getItem("reply-default-speed") as Speed | null;
    if (savedSpeed && SPEEDS.some((s) => s.id === savedSpeed)) setDefaultSpeed(savedSpeed);

    const savedTab = localStorage.getItem("reply-default-tab") as AppMode | null;
    if (savedTab && ["generate", "review", "refine", "archive"].includes(savedTab)) setDefaultTab(savedTab);

    if (localStorage.getItem("reply-clipboard-detect") === "off") setClipboardDetect(false);

    try {
      const raw = localStorage.getItem("reply-history");
      if (raw) setHistoryCount((JSON.parse(raw) as Array<Record<string, unknown>>).length);
    } catch { /* empty */ }

    fetch("/api/style")
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (typeof d.count === "number") setStyleCount(d.count);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("reply-theme", next ? "dark" : "light");
  };

  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem("reply-font-size", size);
    const el = document.getElementById("app-container");
    if (el) el.style.setProperty("zoom", size === "small" ? "0.9" : size === "large" ? "1.1" : "1");
  };

  const handleDefaultTone = (tone: ToneId) => {
    setDefaultTone(tone);
    localStorage.setItem("reply-default-tone", tone);
  };

  const handleDefaultSpeed = (speed: Speed) => {
    setDefaultSpeed(speed);
    localStorage.setItem("reply-default-speed", speed);
  };

  const handleDefaultTab = (tab: AppMode) => {
    setDefaultTab(tab);
    localStorage.setItem("reply-default-tab", tab);
  };

  const handleClipboardToggle = () => {
    const next = !clipboardDetect;
    setClipboardDetect(next);
    localStorage.setItem("reply-clipboard-detect", next ? "on" : "off");
  };

  const handleResetTour = () => {
    localStorage.removeItem("reply-tour-done");
    onResetTour();
    onClose();
  };

  const handleClearHistory = () => {
    if (!confirm("히스토리를 전체 삭제할까요?\n삭제 후 복구할 수 없습니다.")) return;
    localStorage.removeItem("reply-history");
    localStorage.removeItem("reply-favorites");
    setHistoryCount(0);
    window.location.reload();
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 탈퇴하시겠어요?\n\n모든 데이터(크레딧, 히스토리, 말투 학습, 프리셋)가 삭제되며 복구할 수 없습니다.")) return;
    if (!confirm("마지막 확인입니다. 탈퇴를 진행할까요?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        localStorage.clear();
        window.location.href = "/";
      } else {
        const data = await res.json();
        alert(data.error ?? "탈퇴 처리 중 오류가 발생했습니다.");
        setDeleting(false);
      }
    } catch {
      alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setDeleting(false);
    }
  };

  const handleResetStyle = async () => {
    if (styleCount === null || styleCount === 0) return;
    if (!confirm("AI가 학습한 말투 데이터를 초기화할까요?\n다시 5건 이상 수정해야 개인화가 적용됩니다.")) return;
    try {
      await fetch("/api/style", { method: "DELETE" });
      setStyleCount(0);
    } catch { /* empty */ }
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
            <SegmentRow
              title="글자 크기"
              options={FONT_SIZE_OPTIONS}
              value={fontSize}
              onChange={handleFontSize}
            />
          </SettingsGroup>

          {/* 기본값 설정 */}
          <SettingsGroup label="기본값 설정">
            <SegmentRow
              title="기본 톤"
              options={TONES.map((t) => ({ id: t.id, label: t.label }))}
              value={defaultTone}
              onChange={handleDefaultTone}
            />
            <SegmentRow
              title="기본 모드"
              options={SPEEDS.map((s) => ({ id: s.id, label: s.label }))}
              value={defaultSpeed}
              onChange={handleDefaultSpeed}
            />
            <SegmentRow
              title="시작 탭"
              options={TAB_OPTIONS}
              value={defaultTab}
              onChange={handleDefaultTab}
            />
          </SettingsGroup>

          {/* 편의 기능 */}
          <SettingsGroup label="편의 기능">
            <ToggleRow
              title="클립보드 자동 감지"
              description="앱으로 돌아올 때 복사된 텍스트를 자동으로 감지합니다"
              checked={clipboardDetect}
              onChange={handleClipboardToggle}
            />
            <ActionRow
              title="튜토리얼 다시 보기"
              description="앱 사용법을 다시 안내받을 수 있어요"
              buttonLabel="다시 보기"
              onClick={handleResetTour}
            />
          </SettingsGroup>

          {/* Max 전용: 맞춤 키워드 */}
          {plan === "max" && (
            <SettingsGroup label="Max 전용">
              <CustomKeywordSection />
            </SettingsGroup>
          )}

          {/* 데이터 관리 */}
          <SettingsGroup label="데이터 관리">
            <ActionRow
              title="말투 학습 데이터"
              description={styleCount === null ? "로딩 중..." : `AI가 ${styleCount}건의 말투를 학습했어요`}
              buttonLabel="초기화"
              onClick={handleResetStyle}
              variant="danger"
              disabled={!styleCount}
            />
            <ActionRow
              title="히스토리"
              description={`${historyCount}건 저장됨`}
              buttonLabel="전체 삭제"
              onClick={handleClearHistory}
              variant="danger"
              disabled={historyCount === 0}
            />
          </SettingsGroup>

          {/* 계정 */}
          <SettingsGroup label="계정">
            <ActionRow
              title="회원 탈퇴"
              description="모든 데이터가 삭제되며 복구할 수 없어요"
              buttonLabel={deleting ? "처리중..." : "탈퇴하기"}
              onClick={handleDeleteAccount}
              variant="danger"
              disabled={deleting}
            />
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
      <div className="flex-1 mr-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
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

function SegmentRow<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</p>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              value === opt.id
                ? "bg-teal-500 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionRow({
  title,
  description,
  buttonLabel,
  onClick,
  variant = "default",
  disabled = false,
}: {
  title: string;
  description?: string;
  buttonLabel: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1 mr-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
          variant === "danger"
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-300 text-right">{value}</span>
    </div>
  );
}
