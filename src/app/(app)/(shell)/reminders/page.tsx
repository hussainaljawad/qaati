import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listOutstandingPayments } from "@/lib/payments/queries";
import { effectivePaymentStatus } from "@/lib/payments/plan";
import { upcomingEventsForReminder } from "@/lib/reminders/queries";
import { formatDate, formatTime } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import {
  eventReminderText,
  paymentReminderText,
} from "@/lib/notifications/whatsapp";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { SectionHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WhatsappSendButton } from "@/components/app/WhatsappSendButton";

export const metadata: Metadata = { title: "التذكيرات" };

export default async function RemindersPage() {
  const session = await requireActiveSubscription();
  const org = session.organization;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("reminders");
  const tt = await getTranslations("bookings");

  const [outstanding, events] = await Promise.all([
    listOutstandingPayments(org.id),
    upcomingEventsForReminder(org.id, 2),
  ]);

  return (
    <>
      <MashrabiyaHeader title={t("title")} subtitle={org.name} />

      <div className="space-y-6 p-4">
        <section>
          <SectionHeader title={t("duePayments")} />
          {outstanding.length === 0 ? (
            <Empty>{t("noDuePayments")}</Empty>
          ) : (
            <ul className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
              {outstanding.map((p) => {
                const st = effectivePaymentStatus({
                  status: p.status,
                  dueDate: p.dueDate,
                });
                const dateText = formatDate(p.booking.eventDate, locale, {
                  day: "numeric",
                  month: "long",
                });
                return (
                  <li
                    key={p.id}
                    className="rounded-[var(--radius-card)] border border-line bg-paper p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-kufi text-sm font-bold text-ink">
                          {p.booking.client.name}
                        </p>
                        <p className="text-[11px] text-ink-soft">
                          {p.booking.eventType} · {dateText} ·{" "}
                          {tt("ref", { ref: p.booking.reference })}
                        </p>
                      </div>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-bold text-wine">
                          {formatMoney(p.amountFils, locale, { compact: true })}
                        </span>
                        {st === "OVERDUE" ? (
                          <Badge tone="wine">{t("overdueBadge")}</Badge>
                        ) : (
                          <Badge tone="gold">{t("dueBadge")}</Badge>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <WhatsappSendButton
                        phone={p.booking.client.phone}
                        clientId={p.booking.client.id}
                        bookingId={p.booking.id}
                        reminderKind="PAYMENT_DUE"
                        label={t("reminderCta")}
                        body={paymentReminderText({
                          orgName: org.name,
                          clientName: p.booking.client.name,
                          eventType: p.booking.eventType,
                          dateText,
                          remainingText: formatMoney(p.amountFils, locale),
                          dueText: p.dueDate
                            ? formatDate(p.dueDate, locale, {
                                day: "numeric",
                                month: "long",
                              })
                            : undefined,
                          reference: p.booking.reference,
                        })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title={t("upcomingEvents")} />
          {events.length === 0 ? (
            <Empty>{t("noUpcoming")}</Empty>
          ) : (
            <ul className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
              {events.map((b) => {
                const dateText = formatDate(b.eventDate, locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
                return (
                  <li
                    key={b.id}
                    className="rounded-[var(--radius-card)] border border-line bg-paper p-3.5"
                  >
                    <p className="font-kufi text-sm font-bold text-ink">
                      {b.eventType} — {b.client.name}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      {dateText}
                      {b.startTime
                        ? ` · ${formatTime(b.startTime, locale)}`
                        : ""}{" "}
                      · {b.hall.name}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <WhatsappSendButton
                        phone={b.client.phone}
                        clientId={b.client.id}
                        bookingId={b.id}
                        reminderKind="EVENT_DAY_BEFORE"
                        label={t("eventReminderCta")}
                        body={eventReminderText({
                          orgName: org.name,
                          clientName: b.client.name,
                          eventType: b.eventType,
                          dateText,
                          timeText: b.startTime
                            ? formatTime(b.startTime, locale)
                            : undefined,
                          hallName: b.hall.name,
                        })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}
