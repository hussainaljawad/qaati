"use client";

import { Printer } from "lucide-react";

/** زر طباعة — يختفي عند الطباعة نفسها. */
export function PrintButton({ label = "طباعة / حفظ PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl bg-[#2A1B2E] px-4 py-2.5 text-sm font-semibold text-white print:hidden"
    >
      <Printer className="size-4" />
      {label}
    </button>
  );
}
