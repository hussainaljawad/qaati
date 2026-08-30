import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { startOfDay } from "date-fns";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listBookings } from "@/lib/bookings/queries";
import { STATUS_TONE } from "@/lib/bookings/status";
import { getLabels } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "الحجوزات" };

const FILTER_KEYS = [
  "upcoming",
  "HOLD",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export default async function BookingsPage({
  searchParams,
}: PageProps<"/bookings">) {
  const session = await requireActiveSubscription();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("bookings");
  const labels = getLabels(locale);
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : "upcoming";

  const bookings = await listBookings(session.organization.id, {
    ...(filter === "upcoming"
      ? { status: ["HOLD", "CONFIRMED"], from: startOfDay(new Date()) }
      : FILTER_KEYS.includes(filter as (typeof FILTER_KEYS)[number]) &&
          filter !== "upcoming"
        ? {
            status: [
              filter as "HOLD" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
            ],
          }
        : {}),
    take: 100,
  });

  return (
    <>
      <MashrabiyaHeader
        title={t("title")}
        subtitle={session.organization.name}
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
        {FILTER_KEYS.map((key) => (
          <Link
            key={key}
            href={`/bookings?filter=${key}`}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === key
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink"
            }`}
          >
            {t(`filters.${key}`)}
          </Link>
        ))}
      </div>

      <div className="p-4">
        {bookings.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
            {t("empty")}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex h-full items-center justify-between gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-3.5"
              >
                <span
                  className="h-10 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: b.hall.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-kufi text-sm font-bold text-ink">
                    {b.eventType} — {b.client.name}
                  </span>
                  <span className="block text-[11px] text-ink-soft">
                    {formatDate(b.eventDate, locale, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · {b.hall.name}
                    {b.totalAmountFils
                      ? ` · ${formatMoney(b.totalAmountFils - b.discountFils, locale, { compact: true })}`
                      : ""}
                  </span>
                </span>
                <Badge tone={STATUS_TONE[b.status]}>
                  {labels.bookingStatus[b.status]}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
