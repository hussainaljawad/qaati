import type { Locale } from "@/i18n/config";

/**
 * أرقام لاتينية (٠١٢ → 012) مع أسماء الأشهر/الأيام بالعربي.
 * قرار مقصود: أداة إدارة/محاسبة — الأرقام اللاتينية أوضح للمبالغ والتواريخ،
 * وتتفادى التباس «٠». للرجوع لأرقام عربية-هندية: بدّل "ar-u-nu-latn" بـ "ar-BH".
 */
const numberLocale: Record<Locale, string> = {
  ar: "ar-u-nu-latn",
  en: "en-BH",
};

const hijriLocale: Record<Locale, string> = {
  ar: "ar-u-nu-latn-ca-islamic-umalqura",
  en: "en-u-ca-islamic-umalqura",
};

/** تنسيق رقم صحيح حسب اللغة. */
export function formatNumber(value: number, locale: Locale = "ar"): string {
  return new Intl.NumberFormat(numberLocale[locale]).format(value);
}

/** التاريخ الميلادي: «الخميس 27 أغسطس 2026». */
export function formatDate(
  date: Date | string,
  locale: Locale = "ar",
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(numberLocale[locale], options).format(d);
}

/** التاريخ الهجري (أم القرى): «14 صفر 1448 هـ». */
export function formatHijriDate(
  date: Date | string,
  locale: Locale = "ar",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(hijriLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** وقت قصير من نص "HH:MM" أو Date. */
export function formatTime(
  value: string | Date,
  locale: Locale = "ar",
): string {
  let d: Date;
  if (typeof value === "string") {
    const [h, m] = value.split(":").map(Number);
    d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
  } else {
    d = value;
  }
  return new Intl.DateTimeFormat(numberLocale[locale], {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** اسم اليوم المختصر: «خميس». */
export function shortWeekday(date: Date, locale: Locale = "ar"): string {
  return new Intl.DateTimeFormat(numberLocale[locale], {
    weekday: "short",
  }).format(date);
}
