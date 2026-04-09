"use client";

import { useState, useRef, useEffect } from "react";

interface ShareMenuProps {
  content: string;
  index: number;
}

const APP_URL = "https://aireply.co.kr";

function getShareText(content: string): string {
  return `${content}\n\n— 리플라이로 만든 답장\n${APP_URL}`;
}

interface ShareOption {
  label: string;
  icon: React.ReactNode;
  action: (text: string, url: string) => void;
  color: string;
}

function openPopup(url: string) {
  window.open(url, "_blank", "width=600,height=400,noopener,noreferrer");
}

export default function ShareMenu({ content, index }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const text = getShareText(content);
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(APP_URL);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const handleOsShare = async () => {
    if (navigator.share) {
      await navigator.share({ text, url: APP_URL }).catch(() => {});
      setOpen(false);
    }
  };

  const options: ShareOption[] = [
    {
      label: "X (Twitter)",
      color: "hover:bg-slate-100 dark:hover:bg-slate-800",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => openPopup(`https://twitter.com/intent/tweet?text=${encoded}`),
    },
    {
      label: "Facebook",
      color: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
      icon: (
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`),
    },
    {
      label: "WhatsApp",
      color: "hover:bg-green-50 dark:hover:bg-green-950/30",
      icon: (
        <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      action: () => openPopup(`https://wa.me/?text=${encoded}`),
    },
    {
      label: "Telegram",
      color: "hover:bg-sky-50 dark:hover:bg-sky-950/30",
      icon: (
        <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      action: () => openPopup(`https://t.me/share/url?url=${encodedUrl}&text=${encoded}`),
    },
    {
      label: "LINE",
      color: "hover:bg-green-50 dark:hover:bg-green-950/30",
      icon: (
        <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
      action: () => openPopup(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`),
    },
    {
      label: "문자(SMS)",
      color: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
      icon: (
        <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8M8 14h4" />
        </svg>
      ),
      action: () => { window.location.href = `sms:?body=${encoded}`; },
    },
    {
      label: "이메일",
      color: "hover:bg-violet-50 dark:hover:bg-violet-950/30",
      icon: (
        <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 6L2 7" />
        </svg>
      ),
      action: () => { window.location.href = `mailto:?subject=${encodeURIComponent("리플라이로 만든 답장")}&body=${encoded}`; },
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
          open
            ? "border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30"
            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400"
        }`}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
        공유
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50 animate-fade-in-up">
          {/* SNS 옵션들 */}
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(text, APP_URL); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ${opt.color}`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}

          {/* 구분선 */}
          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 링크 복사 */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "복사됨!" : "링크 복사"}
          </button>

          {/* OS 공유 시트 (지원 시) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleOsShare}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              더보기...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
