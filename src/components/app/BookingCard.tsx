import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import type { Locale } from "@/i18n/config";
import { formatDate, formatNumber, formatTime } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { paymentSummary, type UpcomingBooking } from "@/lib/dashboard";

const paymentTone = {
  paidFull: "olive",
  due: "wine",
  depositOnly: "wine",
} as const;

export async function BookingCard({ booking }: { booking: UpcomingBooking }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;

  const summary = paymentSummary(booking);
  const net = booking.totalAmountFils - booking.discountFils;

  return (
    <article className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-kufi text-sm font-bold text-ink">
            {booking.eventType} — {booking.client.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-soft">
            {formatDate(booking.eventDate, locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {booking.startTime
              ? ` · ${formatTime(booking.startTime, locale)}`
              : ""}
          </p>
        </div>
        <Badge tone={paymentTone[summary]}>
          {t(`booking.payment.${summary}`)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-soft">
        {booking.guestsCount ? (
          <span>
            {t("dashboard.guests")}{" "}
            <b className="font-semibold text-ink">
              {formatNumber(booking.guestsCount, locale)}
            </b>
          </span>
        ) : null}
        <span>
          {t("dashboard.hall")}{" "}
          <b className="font-semibold text-ink">{booking.hall.name}</b>
        </span>
        <span>
          {t("dashboard.amount")}{" "}
          <b className="font-semibold text-ink">{formatMoney(net, locale)}</b>
        </span>
      </div>
    </article>
  );
}
