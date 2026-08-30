import { addDays, isSameDay, startOfDay } from "date-fns";
import type { Locale } from "@/i18n/config";
import { formatNumber, shortWeekday } from "@/lib/format";

type DayStatus = "free" | "hold" | "confirmed";

export function DayStrip({
  bookings,
  locale,
  days = 10,
}: {
  bookings: { eventDate: Date; status: string }[];
  locale: Locale;
  days?: number;
}) {
  const today = startOfDay(new Date());

  const statusFor = (date: Date): DayStatus => {
    const hits = bookings.filter((b) => isSameDay(new Date(b.eventDate), date));
    if (hits.some((h) => h.status === "CONFIRMED")) return "confirmed";
    if (hits.some((h) => h.status === "HOLD")) return "hold";
    return "free";
  };

  const dotClass: Record<DayStatus, string> = {
    free: "bg-olive-soft",
    hold: "bg-wine",
    confirmed: "bg-gold-soft",
  };

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {Array.from({ length: days }, (_, i) => {
        const date = addDays(today, i);
        const status = statusFor(date);
        const isToday = i === 0;
        const confirmed = status === "confirmed";

        return (
          <div
            key={i}
            className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-tile)] border ${
              confirmed
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink"
            } ${isToday && !confirmed ? "border-ink" : ""}`}
          >
            <span
              className={`text-[10px] ${confirmed ? "text-paper/70" : "text-ink-soft"}`}
            >
              {shortWeekday(date, locale)}
            </span>
            <span className="font-kufi text-sm font-bold">
              {formatNumber(date.getDate(), locale)}
            </span>
            <span className={`size-1.5 rounded-full ${dotClass[status]}`} />
          </div>
        );
      })}
    </div>
  );
}
