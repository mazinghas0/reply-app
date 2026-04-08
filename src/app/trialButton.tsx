"use client";

import { useState } from "react";
import TrialModal from "./trialModal";

export default function TrialButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
      >
        먼저 체험하기
      </button>
      {open && <TrialModal onClose={() => setOpen(false)} />}
    </>
  );
}
