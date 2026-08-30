"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import {
  formatDate,
  formatNumber,
  formatTime,
  shortWeekday,
} from "@/lib/format";
import { toDateOnlyString } from "@/lib/dates";

const WEEK_STARTS_ON = 6; // السبت

type CalBooking = {
  id: string;
  reference: string;
  eventType: string;
  eventDate: string; // ISO
  startTime: string | null;
  status: "HOLD" | "CONFIRMED" | "COMPLETED";
  hallName: string;
  hallColor: string;
  clientName: string;
};

type Hall = { id: string; name: string; color: string };

export function CalendarView({
  year,
  monthIndex,
  hallId,
  halls,
  bookings,
}: {
  year: number;
  monthIndex: number;
  hallId?: string;
  halls: Hall[];
  bookings: CalBooking[];
}) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("calendar");
  const [selected, setSelected] = useState<Date | null>(null);

  const monthDate = new Date(Date.UTC(year, monthIndex, 1));

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(monthDate), {
      weekStartsOn: WEEK_STARTS_ON,
    });
    const gridEnd = endOfWeek(endOfMonth(monthDate), {
      weekStartsOn: WEEK_STARTS_ON,
    });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [year, monthIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON });
    return Array.from({ length: 7 }, (_, i) =>
      shortWeekday(addDays(base, i), locale),
    );
  }, [locale]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalBooking[]>();
    for (const b of bookings) {
      const key = b.eventDate.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  function go(delta: number) {
    const d = new Date(Date.UTC(year, monthIndex + delta, 1));
    const m = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    router.push(`/calendar?month=${m}${hallId ? `&hall=${hallId}` : ""}`);
  }

  function setHall(id: string | null) {
    const m = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    router.push(`/calendar?month=${m}${id ? `&hall=${id}` : ""}`);
  }

  const selectedKey = selected ? toDateOnlyString(selected) : null;
  const selectedBookings = selectedKey ? (byDay.get(selectedKey) ?? []) : [];

  return (
    <div className="flex flex-1 flex-col">
      {/* شريط التنقّل بين الأشهر */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t("prevMonth")}
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink"
        >
          <ChevronRight className="size-5" />
        </button>
        <span className="font-kufi text-base font-bold text-ink">
          {formatDate(monthDate, locale, { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t("nextMonth")}
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink"
        >
          <ChevronRight className="size-5 rotate-180" />
        </button>
      </div>

      {/* فلتر القاعة */}
      {halls.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
          <Chip
            active={!hallId}
            onClick={() => setHall(null)}
            label={t("allHalls")}
          />
          {halls.map((h) => (
            <Chip
              key={h.id}
              active={hallId === h.id}
              onClick={() => setHall(h.id)}
              label={h.name}
              color={h.color}
            />
          ))}
        </div>
      ) : null}

      {/* الشبكة */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdayLabels.map((w, i) => (
            <div key={i} className="pb-1 text-[10px] font-medium text-ink-soft">
              {w}
            </div>
          ))}
          {days.map((day) => {
            const key = toDateOnlyString(day);
            const dayBookings = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, monthDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selected && isSameDay(day, selected);

            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelected(day)}
                className={`flex aspect-square flex-col items-center gap-1 rounded-lg border p-1 text-xs ${
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : inMonth
                      ? "border-line bg-paper text-ink"
                      : "border-transparent bg-transparent text-ink-soft/40"
                } ${isToday && !isSelected ? "border-gold" : ""}`}
              >
                <span
                  className={`font-kufi text-[13px] font-bold ${isToday ? "text-gold" : ""}`}
                >
                  {formatNumber(day.getDate(), locale)}
                </span>
                <span className="flex gap-0.5">
                  {dayBookings.slice(0, 3).map((b) => (
                    <span
                      key={b.id}
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: b.hallColor }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* لوحة اليوم المختار */}
      <div className="mt-4 flex-1 border-t border-line bg-paper-2/40 px-4 py-4">
        {!selected ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            {t("pickDay")}
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-kufi text-sm font-bold text-ink">
                {formatDate(selected, locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <Link
                href={`/bookings/new?date=${selectedKey}${hallId ? `&hall=${hallId}` : ""}`}
                className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink"
              >
                <Plus className="size-4" /> {t("book")}
              </Link>
            </div>
            {selectedBookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-soft">
                {t("noBookingsDay")}
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedBookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/bookings/${b.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper p-3"
                    >
                      <span
                        className="h-8 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: b.hallColor }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-kufi text-sm font-bold text-ink">
                          {b.eventType} — {b.clientName}
                        </span>
                        <span className="block text-[11px] text-ink-soft">
                          {b.hallName}
                          {b.startTime
                            ? ` · ${formatTime(b.startTime, locale)}`
                            : ""}
                        </span>
                      </span>
                      <StatusDot status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink"
      }`}
    >
      {color ? (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {label}
    </button>
  );
}

function StatusDot({ status }: { status: string }) {
  const tone =
    status === "CONFIRMED"
      ? "bg-olive"
      : status === "HOLD"
        ? "bg-gold"
        : "bg-ink-soft";
  return <span className={`size-2 shrink-0 rounded-full ${tone}`} />;
}
