"use client";

import { useState, useEffect } from "react";

export interface PresetSettings {
  tone: string;
  speed: string;
  relationship: string | null;
  relationshipCustom: string;
  purpose: string | null;
  purposeCustom: string;
  strategy: string | null;
}

interface ServerPreset {
  id: string;
  name: string;
  tone: string;
  speed: string;
  relationship: string | null;
  relationship_custom: string | null;
  purpose: string | null;
  purpose_custom: string | null;
  strategy: string | null;
}

interface PresetPanelProps {
  isAuthenticated: boolean;
  currentSettings: PresetSettings;
  onLoadPreset: (settings: PresetSettings) => void;
}

export default function PresetPanel({ isAuthenticated, currentSettings, onLoadPreset }: PresetPanelProps) {
  const [presets, setPresets] = useState<ServerPreset[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/presets")
      .then((r) => r.json())
      .then((d: { presets?: ServerPreset[] }) => {
        if (d.presets) setPresets(d.presets);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    if (!saveName.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName.trim(),
          tone: currentSettings.tone,
          speed: currentSettings.speed,
          relationship: currentSettings.relationship,
          relationshipCustom: currentSettings.relationshipCustom,
          purpose: currentSettings.purpose,
          purposeCustom: currentSettings.purposeCustom,
          strategy: currentSettings.strategy,
        }),
      });
      const data = (await res.json()) as { success?: boolean; preset?: ServerPreset };
      if (data.success && data.preset) {
        setPresets((prev) => [data.preset as ServerPreset, ...prev]);
        setSaveName("");
        setShowSave(false);
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/presets?id=${id}`, { method: "DELETE" });
    } catch { /* empty */ }
  };

  const handleLoad = (preset: ServerPreset) => {
    setActiveId(preset.id);
    onLoadPreset({
      tone: preset.tone,
      speed: preset.speed,
      relationship: preset.relationship,
      relationshipCustom: preset.relationship_custom ?? "",
      purpose: preset.purpose,
      purposeCustom: preset.purpose_custom ?? "",
      strategy: preset.strategy,
    });
    setTimeout(() => setActiveId(null), 600);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">프리셋</label>
        {!showSave && (
          <button
            onClick={() => setShowSave(true)}
            className="text-[11px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
          >
            + 현재 설정 저장
          </button>
        )}
      </div>

      {/* 저장 입력 */}
      {showSave && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setShowSave(false); setSaveName(""); } }}
            placeholder="프리셋 이름 (예: 거래처 거절)"
            maxLength={20}
            autoFocus
            className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim() || saving}
            className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? "..." : "저장"}
          </button>
          <button
            onClick={() => { setShowSave(false); setSaveName(""); }}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            취소
          </button>
        </div>
      )}

      {/* 프리셋 칩 */}
      {presets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className={`group shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                activeId === preset.id
                  ? "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
              onClick={() => handleLoad(preset)}
            >
              <span>{preset.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(preset.id); }}
                className="ml-0.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {presets.length === 0 && !showSave && (
        <p className="text-xs text-slate-400 dark:text-slate-600">자주 쓰는 설정 조합을 저장해두면 한 번에 불러올 수 있어요</p>
      )}
    </div>
  );
}
