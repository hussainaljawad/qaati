"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { localeLabel, type Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setLocale(next))}
      className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-2 disabled:opacity-50"
    >
      {localeLabel[next]}
    </button>
  );
}
