import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { MessageCircle, Pencil, Plus } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getClient } from "@/lib/clients/queries";
import { listClientCommunications } from "@/lib/communications/queries";
import { STATUS_TONE } from "@/lib/bookings/status";
import { getLabels } from "@/lib/labels";
import { formatDate, formatNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { waLink } from "@/lib/notifications/whatsapp";
import type { Locale } from "@/i18n/config";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ClientTags } from "@/components/clients/ClientTags";
import { CommunicationTimeline } from "@/components/clients/CommunicationTimeline";

export const metadata: Metadata = { title: "ملف العميل" };

export default async function ClientPage({
  params,
}: PageProps<"/clients/[id]">) {
  const session = await requireActiveSubscription();
  const { id } = await params;
  const locale = (await getLocale()) as Locale;

  const client = await getClient(session.organization.id, id);
  if (!client) notFound();

  const t = await getTranslations("clients.profile");
  const tc = await getTranslations("common");
  const tb = await getTranslations("clients");
  const bookingLabels = getLabels(locale).bookingStatus;
  const communications = await listClientCommunications(
    session.organization.id,
    id,
  );

  const totalValue = client.bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + (b.totalAmountFils - b.discountFils), 0);

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={tb("bookingsCount", {
          count: formatNumber(client._count.bookings, locale),
        })}
        backHref="/clients"
        action={
          <Link
            href={`/clients/${client.id}/edit`}
            aria-label={tc("edit")}
            className="flex size-8 items-center justify-center rounded-full bg-paper/10"
          >
            <Pencil className="size-4" />
          </Link>
        }
      />

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <div>
            <p className="text-[11px] text-ink-soft">{t("phone")}</p>
            <p dir="ltr" className="font-semibold text-ink">
              {client.phone}
            </p>
          </div>
          <a
            href={waLink(client.phone, `مرحباً ${client.name} 👋`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-olive px-3 py-1.5 text-xs font-semibold text-white"
          >
            <MessageCircle className="size-4" /> {tc("whatsapp")}
          </a>
        </div>

        <ClientTags clientId={client.id} tags={client.tags} />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-tile)] border border-line bg-paper p-3 text-center">
            <p className="font-kufi text-lg font-bold text-ink">
              {formatNumber(client._count.bookings, locale)}
            </p>
            <p className="text-[10.5px] text-ink-soft">{t("totalBookings")}</p>
          </div>
          <div className="rounded-[var(--radius-tile)] border border-line bg-paper p-3 text-center">
            <p className="font-kufi text-base font-bold text-olive">
              {formatMoney(totalValue, locale, { compact: true })}
            </p>
            <p className="text-[10.5px] text-ink-soft">{t("dealsValue")}</p>
          </div>
        </div>

        {client.preferences ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
            <h3 className="mb-1 font-kufi text-sm font-bold text-ink">
              {t("preferences")}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-ink-soft">
              {client.preferences}
            </p>
          </div>
        ) : null}
        {client.notes ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
            <h3 className="mb-1 font-kufi text-sm font-bold text-ink">
              {t("notes")}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-ink-soft">
              {client.notes}
            </p>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-kufi text-sm font-bold text-ink">
              {t("history")}
            </h3>
            <Link
              href={`/bookings/new?client=${client.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-gold"
            >
              <Plus className="size-3.5" /> {t("newBooking")}
            </Link>
          </div>
          {client.bookings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
              {t("noHistory")}
            </p>
          ) : (
            <ul className="space-y-2">
              {client.bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper p-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {b.eventType} · {b.hall.name}
                      </span>
                      <span className="block text-[11px] text-ink-soft">
                        {formatDate(b.eventDate, locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                    <Badge tone={STATUS_TONE[b.status]}>
                      {bookingLabels[b.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CommunicationTimeline
          clientId={client.id}
          locale={locale}
          entries={communications.map((c) => ({
            id: c.id,
            type: c.type,
            body: c.body,
            createdAt: c.createdAt.toISOString(),
            createdByName: c.createdBy?.name ?? null,
            bookingRef: c.booking?.reference ?? null,
          }))}
        />
      </div>
    </>
  );
}
