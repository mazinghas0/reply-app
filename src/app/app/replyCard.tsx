"use client";

import { useState } from "react";
import ShareMenu from "./shareMenu";
import { type Reply, type ToneId, type Speed, TONE_COLORS } from "./shared";
import { IconCopy, IconCheck } from "./icons";

interface ReplyCardSectionProps {
  replies: Reply[];
  tone: ToneId;
  speed: Speed;
  inputMessage: string;
  isAuthenticated: boolean;
  relationship: string | null;
  relationshipCustom: string;
}

export default function ReplyCardSection({
  replies,
  tone,
  speed,
  inputMessage,
  isAuthenticated,
  relationship,
  relationshipCustom,
}: ReplyCardSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedReplyIndex, setExpandedReplyIndex] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, string[]>>({});
  const [expandLoading, setExpandLoading] = useState(false);
  const [editingReplyIndex, setEditingReplyIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleCopy = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEditCopy = async (originalContent: string, index: number) => {
    const edited = editText.trim();
    if (!edited) return;
    await navigator.clipboard.writeText(edited);
    setCopiedKey(`edit-${index}`);
    setTimeout(() => setCopiedKey(null), 2000);
    setEditingReplyIndex(null);
    setEditText("");
    if (isAuthenticated && edited !== originalContent.trim()) {
      const rel = relationship === "custom" ? relationshipCustom : relationship;
      fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: originalContent,
          edited,
          tone,
          relationship: rel ?? undefined,
        }),
      }).catch(() => {});
    }
  };

  const handleExpand = async (replyIndex: number, variant: "stronger" | "softer" | "shorter") => {
    const original = replies[replyIndex]?.content;
    if (!original) return;
    setExpandLoading(true);
    setExpandedReplyIndex(replyIndex);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          tone,
          speed,
          expand: { original, variant },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "확장 실패");
      const texts = (data.replies as Reply[]).map((r: Reply) => r.content);
      setExpandedReplies((prev) => ({ ...prev, [replyIndex]: texts }));
    } catch {
      // 에러 시 무시
    } finally {
      setExpandLoading(false);
      setExpandedReplyIndex(null);
    }
  };

  if (replies.length === 0) return null;

  return (
    <section className="w-full mt-8 space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider">답장 제안</h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
      </div>
      {replies.map((reply, index) => (
        <div
          key={index}
          className={`animate-fade-in-up p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-2 ${TONE_COLORS[tone]} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{reply.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {editingReplyIndex === index ? (
                <>
                  <button
                    onClick={() => handleEditCopy(reply.content, index)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      copiedKey === `edit-${index}`
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                        : "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40"
                    }`}
                  >
                    {copiedKey === `edit-${index}` ? <><IconCheck /> 저장됨</> : <><IconCopy /> 수정 복사</>}
                  </button>
                  <button
                    onClick={() => { setEditingReplyIndex(null); setEditText(""); }}
                    className="text-xs px-2 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleCopy(reply.content, `reply-${index}`)}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      copiedKey === `reply-${index}`
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {copiedKey === `reply-${index}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                  </button>
                  <button
                    onClick={() => { setEditingReplyIndex(index); setEditText(reply.content); }}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
                  >
                    수정 후 복사
                  </button>
                </>
              )}
            </div>
          </div>
          {editingReplyIndex === index ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
            />
          ) : (
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">{reply.content}</p>
          )}

          {/* Expand + Share buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {(["stronger", "softer", "shorter"] as const).map((variant) => {
              const labels = { stronger: "더 강하게", softer: "더 부드럽게", shorter: "더 짧게" };
              return (
                <button
                  key={variant}
                  onClick={() => handleExpand(index, variant)}
                  disabled={expandLoading && expandedReplyIndex === index}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {expandLoading && expandedReplyIndex === index ? "..." : labels[variant]}
                </button>
              );
            })}
            <div className="flex-1" />
            <ShareMenu content={reply.content} index={index} />
          </div>

          {/* Expanded replies */}
          {expandedReplies[index] && (
            <div className="mt-3 space-y-2">
              {expandedReplies[index].map((expanded, ei) => (
                <div key={ei} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                      {["더 강하게", "더 부드럽게", "더 짧게"][ei]}
                    </span>
                    <button
                      onClick={() => handleCopy(expanded, `expand-${index}-${ei}`)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        copiedKey === `expand-${index}-${ei}`
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {copiedKey === `expand-${index}-${ei}` ? <><IconCheck /> 복사됨</> : <><IconCopy /> 복사</>}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{expanded}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
