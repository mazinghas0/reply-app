"use client";

import { useState, useEffect } from "react";

type KeywordKind = "relationship" | "purpose";

export interface CustomKeyword {
  id: string;
  kind: KeywordKind;
  label: string;
  description: string | null;
  created_at: string;
}

interface CustomKeywordModalProps {
  onClose: () => void;
}

const KIND_TABS: Array<{ id: KeywordKind; label: string; placeholder: string }> = [
  { id: "relationship", label: "관계 키워드", placeholder: "예: 단골 손님, 동호회 회장" },
  { id: "purpose", label: "상황 키워드", placeholder: "예: 환불 요청, 공지 전달" },
];

const KEYWORD_LIMIT = 30;

export default function CustomKeywordModal({ onClose }: CustomKeywordModalProps) {
  const [activeKind, setActiveKind] = useState<KeywordKind>("relationship");
  const [keywords, setKeywords] = useState<CustomKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((d: { keywords?: CustomKeyword[] }) => {
        setKeywords(d.keywords ?? []);
      })
      .catch(() => setKeywords([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = keywords.filter((k) => k.kind === activeKind);
  const totalCount = keywords.length;
  const reachedLimit = totalCount >= KEYWORD_LIMIT;

  const resetForm = () => {
    setLabel("");
    setDescription("");
    setShowAdd(false);
    setError("");
  };

  const handleSave = async () => {
    if (!label.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: activeKind,
          label: label.trim(),
          description: description.trim(),
        }),
      });
      const data = (await res.json()) as { success?: boolean; keyword?: CustomKeyword; error?: string };
      if (!res.ok || !data.success || !data.keyword) {
        setError(data.error ?? "저장에 실패했어요.");
        setSaving(false);
        return;
      }
      setKeywords((prev) => [data.keyword as CustomKeyword, ...prev]);
      resetForm();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    try {
      await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
    } catch {
      // 무시 (UI는 이미 갱신됨)
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">내 키워드</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalCount} / {KEYWORD_LIMIT}개 등록됨
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800">
            {KIND_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveKind(tab.id); resetForm(); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeKind === tab.id
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
              불러오는 중...
            </p>
          ) : (
            <>
              {/* Add form */}
              {showAdd ? (
                <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-2">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={KIND_TABS.find((t) => t.id === activeKind)?.placeholder ?? ""}
                    maxLength={30}
                    autoFocus
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="설명 (선택, 80자)"
                    maxLength={80}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  />
                  {error && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!label.trim() || saving}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {saving ? "저장중..." : "저장"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAdd(true); setError(""); }}
                  disabled={reachedLimit}
                  className="w-full mb-4 px-3 py-2.5 text-xs font-medium border border-dashed border-teal-300 dark:border-teal-700 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {reachedLimit ? `최대 ${KEYWORD_LIMIT}개까지 등록 가능` : "+ 키워드 추가"}
                </button>
              )}

              {/* List */}
              {filtered.length > 0 ? (
                <div className="space-y-1.5">
                  {filtered.map((kw) => (
                    <div
                      key={kw.id}
                      className="group flex items-start justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {kw.label}
                        </p>
                        {kw.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {kw.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(kw.id)}
                        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        aria-label="삭제"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">
                  아직 등록한 {activeKind === "relationship" ? "관계" : "상황"} 키워드가 없어요
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
