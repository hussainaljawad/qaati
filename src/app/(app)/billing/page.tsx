import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { effectiveStatus, trialDaysLeft } from "@/lib/billing/subscription";
import { STANDARD_PLAN } from "@/lib/billing/plans";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { logoutAction } from "@/app/actions/auth";
import { SubscribePanel } from "@/components/forms/SubscribePanel";

export const metadata = { title: "الاشتراك" };

export default async function BillingPage() {
  const session = await requireUser();
  const t = await getTranslations("billing");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  const status = effectiveStatus(session.subscription);
  const daysLeft = trialDaysLeft(session.subscription);
  const isActive = status === "ACTIVE";

  return (
    <>
      <MashrabiyaHeader
        title={t("title")}
        subtitle={session.organization.name}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {isActive ? (
          <div className="rounded-[var(--radius-card)] border border-olive-soft bg-olive-soft/40 p-4">
            <p className="font-kufi font-bold text-olive">
              {t("statusActive")}
            </p>
            {session.subscription?.currentPeriodEnd ? (
              <p className="mt-1 text-sm text-ink-soft">
                {t("renewsOn", {
                  date: formatDate(
                    session.subscription.currentPeriodEnd,
                    locale,
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  ),
                })}
              </p>
            ) : null}
          </div>
        ) : status === "TRIALING" ? (
          <div className="rounded-[var(--radius-card)] border border-gold-soft bg-gold-soft/40 p-4">
            <p className="font-kufi font-bold text-ink">{t("trialActive")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("trialDaysLeft", { days: daysLeft })}
            </p>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-wine-soft bg-wine-soft/40 p-4">
            <p className="font-kufi font-bold text-wine">
              {t("trialEndedTitle")}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{t("trialEndedBody")}</p>
          </div>
        )}

        {!isActive ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
            <p className="font-kufi text-base font-bold text-ink">
              {locale === "ar" ? STANDARD_PLAN.nameAr : STANDARD_PLAN.nameEn}
            </p>
            <ul className="my-3 space-y-1.5 text-sm text-ink-soft">
              {STANDARD_PLAN.features.map((f) => (
                <li key={f.en} className="flex gap-2">
                  <span className="text-gold">◆</span>
                  {locale === "ar" ? f.ar : f.en}
                </li>
              ))}
            </ul>
            <SubscribePanel
              priceMonthlyFils={STANDARD_PLAN.priceFilsMonthly}
              priceYearlyFils={STANDARD_PLAN.priceFilsYearly}
            />
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <Link href="/dashboard" className="font-medium text-gold">
            {tc("back")}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-ink-soft">
              {tc("logout")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
