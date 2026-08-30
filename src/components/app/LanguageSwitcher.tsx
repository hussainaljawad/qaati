"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { localeLabel, locales, type Locale } from "@/i18n/config";

/** مبدّل لغة الواجهة (عربي ⇄ إنجليزي). يعمل عبر كوكي + إعادة تحميل. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const current = useLocale() as Locale;
  const [pending, start] = useTransition();

  function pick(l: Locale) {
    if (l === current) return;
    start(() => setLocale(l));
  }

  if (compact) {
    const other = locales.find((l) => l !== current)!;
    return (
      <button
        type="button"
        onClick={() => pick(other)}
        disabled={pending}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-current opacity-70 hover:opacity-100 disabled:opacity-50"
      >
        <Languages className="size-4" />
        {localeLabel[other]}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="size-4 text-ink-soft" />
      <div className="flex overflow-hidden rounded-xl border border-line">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            disabled={pending}
            className={`px-4 py-2 text-sm font-semibold ${
              l === current ? "bg-ink text-paper" : "bg-paper text-ink"
            }`}
          >
            {localeLabel[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
