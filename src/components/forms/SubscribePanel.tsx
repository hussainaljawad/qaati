"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  requestSubscriptionAction,
  type BillingState,
} from "@/app/actions/billing";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/i18n/config";

const initial: BillingState = {};

export function SubscribePanel({
  priceMonthlyFils,
  priceYearlyFils,
}: {
  priceMonthlyFils: number;
  priceYearlyFils: number;
}) {
  const t = useTranslations("billing");
  const locale = useLocale() as Locale;
  const [state, action, pending] = useActionState(
    requestSubscriptionAction,
    initial,
  );

  if (state.requested) {
    return (
      <p className="rounded-[var(--radius-card)] border border-olive-soft bg-olive-soft/50 px-4 py-3 text-center text-sm font-medium text-olive">
        {t("requestSent")}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2.5">
      <Button
        type="submit"
        name="interval"
        value="monthly"
        size="lg"
        disabled={pending}
      >
        {t("subscribeMonthly")} —{" "}
        {formatMoney(priceMonthlyFils, locale, { compact: true })}
      </Button>
      <Button
        type="submit"
        name="interval"
        value="yearly"
        size="lg"
        variant="secondary"
        disabled={pending}
      >
        {t("subscribeYearly")} —{" "}
        {formatMoney(priceYearlyFils, locale, { compact: true })}
      </Button>
      <p className="pt-1 text-xs leading-5 text-ink-soft">{t("manualNote")}</p>
    </form>
  );
}
