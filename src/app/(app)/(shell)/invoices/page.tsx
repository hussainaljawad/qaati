import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listInvoices } from "@/lib/invoices/queries";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "الفواتير" };

const TONE = {
  DRAFT: "neutral",
  ISSUED: "gold",
  PAID: "olive",
  VOID: "wine",
} as const;

const FILTER_KEYS = ["all", "DRAFT", "ISSUED", "PAID"] as const;

export default async function InvoicesPage({
  searchParams,
}: PageProps<"/invoices">) {
  const session = await requireActiveSubscription();
  const locale = (await getLocale()) as Locale;
  const sp = await searchParams;
  const t = await getTranslations("invoices");
  const labels = getLabels(locale).invoiceStatus;
  const filter = typeof sp.filter === "string" ? sp.filter : "all";

  const invoices = await listInvoices(session.organization.id, {
    status:
      filter !== "all"
        ? [filter as "DRAFT" | "ISSUED" | "PAID" | "VOID"]
        : undefined,
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
            href={`/invoices?filter=${key}`}
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
        {invoices.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
            {t("empty")}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {invoices.map((inv) => {
              const tone = TONE[inv.status];
              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-3.5"
                >
                  <span className="min-w-0">
                    <span
                      className="block font-kufi text-sm font-bold text-ink"
                      dir="ltr"
                    >
                      {inv.invoiceNumber}
                    </span>
                    <span className="block text-[11px] text-ink-soft">
                      {inv.client?.name ?? "—"} ·{" "}
                      {formatDate(inv.issueDate, locale, {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-bold text-ink">
                      {formatMoney(inv.totalFils, locale, { compact: true })}
                    </span>
                    <Badge tone={tone}>{labels[inv.status]}</Badge>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
