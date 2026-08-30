import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getLabels } from "@/lib/labels";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listHalls } from "@/lib/halls/queries";
import { toggleHallActiveAction } from "@/app/actions/halls";
import { formatMoney } from "@/lib/money";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "القاعات" };

export default async function HallsPage() {
  const session = await requireAdmin();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("halls");
  const sectionLabels = getLabels(locale).hallSection;
  const halls = await listHalls(session.organization.id);

  return (
    <>
      <PageHeader
        title={t("title")}
        backHref="/settings"
        action={
          <Link
            href="/settings/halls/new"
            aria-label={t("new")}
            className="flex size-8 items-center justify-center rounded-full bg-gold text-ink"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {halls.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
            {t("empty")}
          </p>
        ) : (
          halls.map((h) => (
            <div
              key={h.id}
              className={`rounded-[var(--radius-card)] border bg-paper p-4 ${
                h.isActive
                  ? "border-line"
                  : "border-dashed border-line opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: h.color }}
                  />
                  <div>
                    <p className="font-kufi text-sm font-bold text-ink">
                      {h.name}
                    </p>
                    <p className="text-[11px] text-ink-soft">
                      {sectionLabels[h.section]}
                      {h.capacitySeated
                        ? ` · ${t("guestsSuffix", { count: formatNumber(h.capacitySeated, locale) })}`
                        : ""}
                      {h.basePriceFils
                        ? ` · ${formatMoney(h.basePriceFils, locale, { compact: true })}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/settings/halls/${h.id}`}
                  className="text-xs font-semibold text-gold"
                >
                  {t("edit")}
                </Link>
              </div>
              <form action={toggleHallActiveAction} className="mt-2">
                <input type="hidden" name="id" value={h.id} />
                <button
                  type="submit"
                  className="text-[11px] font-medium text-ink-soft underline"
                >
                  {h.isActive ? t("disable") : t("enable")}
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </>
  );
}
