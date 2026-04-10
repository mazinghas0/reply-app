"use client";

import { useState, useEffect } from "react";
import CustomKeywordModal from "./customKeywordModal";

interface CountResponse {
  keywords?: Array<{ id: string }>;
}

export default function CustomKeywordSection() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((d: CountResponse) => {
        if (!cancelled) setCount(d.keywords?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1 mr-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">맞춤 키워드</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {count === null ? "불러오는 중..." : `${count}개 등록 · 관계와 상황을 직접 추가`}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors cursor-pointer"
        >
          관리하기
        </button>
      </div>
      {open && <CustomKeywordModal onClose={() => setOpen(false)} />}
    </>
  );
}
