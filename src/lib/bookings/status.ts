import type { BookingStatus } from "@prisma/client";

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "HOLD",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

/** الحالات التي تحجز الموعد فعلياً (تدخل في فحص التعارض). */
export const ACTIVE_STATUSES: readonly BookingStatus[] = [
  "HOLD",
  "CONFIRMED",
] as const;

/** الانتقالات المسموحة بين حالات الحجز. */
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  HOLD: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: ["HOLD", "CONFIRMED"], // إحياء حجز ملغي (إن كان الموعد فاضي)
  COMPLETED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return false;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedTransitions(from: BookingStatus): BookingStatus[] {
  return TRANSITIONS[from] ?? [];
}

/** هل الانتقال يعيد الحجز إلى حالة نشطة (تحتاج فحص تعارض)؟ */
export function reactivates(to: BookingStatus): boolean {
  return (ACTIVE_STATUSES as readonly string[]).includes(to);
}

export const STATUS_TONE: Record<
  BookingStatus,
  "gold" | "olive" | "wine" | "neutral"
> = {
  HOLD: "gold",
  CONFIRMED: "olive",
  CANCELLED: "wine",
  COMPLETED: "neutral",
};
