import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BellRing, ListChecks } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getDashboardData } from "@/lib/dashboard";
import { listWaitlist } from "@/lib/waitlist/queries";
import { formatMoney } from "@/lib/money";
import { formatDate, formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { StatTile } from "@/components/ui/StatTile";
import { SectionHeader } from "@/components/ui/Card";
import { DayStrip } from "@/components/app/DayStrip";
import { BookingCard } from "@/components/app/BookingCard";

export const metadata: Metadata = { title: "الرئيسية" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export default async function DashboardPage() {
  const session = await requireActiveSubscription();
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const org = session.organization;
  const isAdmin = session.user.role === "ADMIN";

  const [data, waitlist] = await Promise.all([
    getDashboardData(org.id),
    listWaitlist(org.id, { status: ["WAITING"] }),
  ]);

  const monthLabel = formatDate(new Date(), locale, {
    month: "long",
    year: "numeric",
  });
  const collectionRate =
    data.expectedFils > 0
      ? Math.round((data.collectedFils / data.expectedFils) * 100)
      : 0;

  return (
    <>
      <MashrabiyaHeader
        title={org.name}
        subtitle={t("dashboard.title")}
        avatar={initials(session.user.name)}
        avatarHref={isAdmin ? "/settings" : undefined}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-kufi text-2xl font-bold">{monthLabel}</span>
          <span className="text-xs text-paper/70">
            {t("dashboard.monthBookingsInline", {
              count: data.monthBookingsCount,
            })}
          </span>
        </div>
      </MashrabiyaHeader>

      <div className="grid grid-cols-3 gap-2.5 px-4 pt-4">
        <StatTile
          accent="gold"
          value={formatNumber(data.monthBookingsCount, locale)}
          label={t("dashboard.monthBookings")}
        />
        <StatTile
          accent="wine"
          value={formatNumber(data.overdueCount, locale)}
          label={t("dashboard.latePayments")}
        />
        <StatTile
          accent="olive"
          value={formatMoney(data.collectedFils, locale, { compact: true })}
          label={t("dashboard.monthRevenue")}
        />
      </div>

      {/* لوحة المال */}
      <div className="mx-4 mt-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs text-ink-soft">
            محصّل / متوقّع هذا الشهر
          </span>
          <span className="font-kufi text-sm font-bold text-olive">
            {formatNumber(collectionRate, locale)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-paper-2">
          <div
            className="h-full rounded-full bg-olive"
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-soft">
          <span>{formatMoney(data.collectedFils, locale)}</span>
          <span>{formatMoney(data.expectedFils, locale)}</span>
        </div>
        {data.overdueFils > 0 ? (
          <Link
            href="/reminders"
            className="mt-3 flex items-center gap-2 rounded-lg bg-wine-soft px-3 py-2 text-xs font-medium text-wine"
          >
            <BellRing className="size-4" />
            متأخرات {formatMoney(data.overdueFils, locale)} — أرسل تذكيرات
            <span className="ms-auto">‹</span>
          </Link>
        ) : null}
      </div>

      {waitlist.length > 0 ? (
        <Link
          href="/waitlist"
          className="mx-4 mt-3 flex items-center gap-2 rounded-[var(--radius-tile)] border border-gold-soft bg-gold-soft/30 px-3 py-2.5 text-xs font-medium text-ink"
        >
          <ListChecks className="size-4 text-gold" />
          {formatNumber(waitlist.length, locale)} على قائمة الانتظار
          <span className="ms-auto text-gold">‹</span>
        </Link>
      ) : null}

      <section className="px-4 pt-5">
        <SectionHeader
          title={t("dashboard.calendarTitle")}
          action={
            <Link href="/calendar" className="text-xs font-medium text-gold">
              {t("dashboard.viewAll")} ‹
            </Link>
          }
        />
        <DayStrip
          locale={locale}
          bookings={data.upcoming.map((b) => ({
            eventDate: b.eventDate,
            status: b.status,
          }))}
        />
      </section>

      <section className="px-4 pb-6 pt-6">
        <SectionHeader
          title={t("dashboard.upcomingTitle")}
          action={
            <Link href="/bookings" className="text-xs font-medium text-gold">
              {t("dashboard.viewAll")} ‹
            </Link>
          }
        />
        {data.upcoming.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-paper-2/50 px-4 py-8 text-center text-sm text-ink-soft">
            {t("dashboard.empty")}
          </p>
        ) : (
          <div className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-2.5 lg:space-y-0">
            {data.upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
