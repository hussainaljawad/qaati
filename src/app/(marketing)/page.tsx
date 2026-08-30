import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, MessageCircle, ReceiptText, Users } from "lucide-react";
import { STANDARD_PLAN, TRIAL_DAYS } from "@/lib/billing/plans";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/i18n/config";

export default async function LandingPage() {
  const t = await getTranslations("marketing");
  const locale = (await getLocale()) as Locale;

  const features = [
    { icon: CalendarDays, title: t("feature1Title"), body: t("feature1Body") },
    { icon: MessageCircle, title: t("feature2Title"), body: t("feature2Body") },
    { icon: ReceiptText, title: t("feature3Title"), body: t("feature3Body") },
    { icon: Users, title: t("feature4Title"), body: t("feature4Body") },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Hero */}
      <section className="py-12 text-center sm:py-20">
        <p className="mb-3 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold">
          {t("trialNote", { days: TRIAL_DAYS })}
        </p>
        <h1 className="mx-auto max-w-2xl font-kufi text-3xl font-bold leading-tight text-ink sm:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-soft">
          {t("heroSubtitle")}
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gold px-6 text-base font-semibold text-ink hover:bg-gold/90 sm:w-auto"
          >
            {t("ctaStart")}
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-line px-6 text-base font-semibold text-ink hover:bg-paper-2 sm:w-auto"
          >
            {t("ctaLogin")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <h2 className="mb-6 text-center font-kufi text-xl font-bold text-ink">
          {t("featuresTitle")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[var(--radius-card)] border border-line bg-paper p-5"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-wine-soft text-wine">
                <Icon className="size-5" />
              </div>
              <h3 className="font-kufi text-base font-bold text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12">
        <h2 className="mb-6 text-center font-kufi text-xl font-bold text-ink">
          {t("pricingTitle")}
        </h2>
        <div className="mx-auto max-w-sm rounded-[var(--radius-card)] border-2 border-gold bg-paper p-6 text-center">
          <p className="font-kufi text-lg font-bold text-ink">
            {locale === "ar" ? STANDARD_PLAN.nameAr : STANDARD_PLAN.nameEn}
          </p>
          <p className="mt-3">
            <span className="font-kufi text-3xl font-bold text-ink">
              {formatMoney(STANDARD_PLAN.priceFilsMonthly, locale, {
                compact: true,
              })}
            </span>
            <span className="text-sm text-ink-soft"> {t("perMonth")}</span>
          </p>
          <p className="mt-1 text-xs text-olive">{t("yearlyNote")}</p>
          <ul className="mt-5 space-y-2 text-start text-sm text-ink-soft">
            {STANDARD_PLAN.features.map((f) => (
              <li key={f.en} className="flex gap-2">
                <span className="text-gold">◆</span>
                {locale === "ar" ? f.ar : f.en}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-gold px-6 text-base font-semibold text-ink hover:bg-gold/90"
          >
            {t("ctaStart")}
          </Link>
        </div>
      </section>
    </div>
  );
}
