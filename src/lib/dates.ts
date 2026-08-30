/**
 * تواريخ المناسبات تُخزَّن كـ DATE (بلا وقت). نثبّتها على منتصف ليل UTC
 * حتى لا تنزلق يوماً بسبب المنطقة الزمنية.
 */

/** "2026-09-15" → Date عند 00:00:00 UTC. */
export function parseDateOnly(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "2026-09-15" (بتوقيت UTC). */
export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** بداية اليوم (UTC) لتاريخ ما — للمقارنات. */
export function startOfDayUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** هل التاريخ اليوم أو في المستقبل؟ (بدقة اليوم) */
export function isTodayOrFuture(date: Date): boolean {
  const today = startOfDayUtc(new Date());
  return startOfDayUtc(date).getTime() >= today.getTime();
}
