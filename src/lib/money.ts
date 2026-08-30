/**
 * كل المبالغ في «قاعتي» تُخزَّن كأعداد صحيحة بالفلس.
 * الدينار البحريني = ١٠٠٠ فلس (٣ خانات عشرية).
 */

export const FILS_PER_BHD = 1000;

/** تحويل دينار (رقم عشري من إدخال المستخدم) إلى فلس صحيح. */
export function bhdToFils(bhd: number | string): number {
  const n = typeof bhd === "string" ? Number(bhd.replace(/[^\d.-]/g, "")) : bhd;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * FILS_PER_BHD);
}

/** تحويل فلس إلى دينار (رقم عشري) — للحسابات والعرض. */
export function filsToBhd(fils: number): number {
  return fils / FILS_PER_BHD;
}

/**
 * تنسيق مبلغ بالفلس كنص عملة.
 * @example formatMoney(1100000) => "١٬١٠٠٫٠٠٠ د.ب"  (locale = ar)
 */
export function formatMoney(
  fils: number,
  locale: string = "ar",
  options: { currency?: string; withSymbol?: boolean; compact?: boolean } = {},
): string {
  const { currency = "BHD", withSymbol = true, compact = false } = options;
  const value = filsToBhd(fils);

  // أرقام لاتينية حتى في الواجهة العربية (أوضح للمبالغ). compact = دينار صحيح بلا كسور.
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en-BH", {
    minimumFractionDigits: compact ? 0 : 3,
    maximumFractionDigits: compact ? 0 : 3,
  });

  const number = nf.format(compact ? Math.round(value) : value);
  if (!withSymbol) return number;

  const symbol = locale === "ar" ? "د.ب" : currency;
  return `${number} ${symbol}`;
}

/** مجموع قائمة مبالغ بالفلس. */
export function sumFils(amounts: Array<number | null | undefined>): number {
  return amounts.reduce<number>((total, a) => total + (a ?? 0), 0);
}
