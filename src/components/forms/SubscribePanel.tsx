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

type Bank = {
  bankName: string | null;
  bankAccountName: string | null;
  bankIban: string | null;
  bankAccountNumber: string | null;
  benefitNumber: string | null;
  paymentNote: string | null;
};

export function SubscribePanel({
  priceMonthlyFils,
  priceYearlyFils,
  bank,
}: {
  priceMonthlyFils: number;
  priceYearlyFils: number;
  bank?: Bank;
}) {
  const t = useTranslations("billing");
  const locale = useLocale() as Locale;
  const [state, action, pending] = useActionState(
    requestSubscriptionAction,
    initial,
  );

  const hasBank =
    bank && (bank.bankName || bank.bankIban || bank.benefitNumber);

  const bankBlock = hasBank ? (
    <div className="mt-3 space-y-1 rounded-[var(--radius-card)] border border-line bg-paper-2/60 p-3 text-sm">
      <p className="mb-1 font-kufi text-xs font-bold text-ink">
        {t("bankTransferTitle")}
      </p>
      {bank!.bankName ? <Row k={t("bankName")} v={bank!.bankName} /> : null}
      {bank!.bankAccountName ? (
        <Row k={t("bankAccountName")} v={bank!.bankAccountName} />
      ) : null}
      {bank!.bankIban ? <Row k="IBAN" v={bank!.bankIban} ltr /> : null}
      {bank!.bankAccountNumber ? (
        <Row k={t("bankAccountNumber")} v={bank!.bankAccountNumber} ltr />
      ) : null}
      {bank!.benefitNumber ? (
        <Row k={t("benefitNumber")} v={bank!.benefitNumber} ltr />
      ) : null}
      {bank!.paymentNote ? (
        <p className="pt-1 text-xs text-ink-soft">{bank!.paymentNote}</p>
      ) : null}
    </div>
  ) : null;

  if (state.requested) {
    return (
      <div>
        <p className="rounded-[var(--radius-card)] border border-olive-soft bg-olive-soft/50 px-4 py-3 text-center text-sm font-medium text-olive">
          {t("requestSent")}
        </p>
        {bankBlock}
      </div>
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
      {bankBlock}
    </form>
  );
}

function Row({ k, v, ltr }: { k: string; v: string; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-soft">{k}</span>
      <span className="font-medium text-ink" dir={ltr ? "ltr" : undefined}>
        {v}
      </span>
    </div>
  );
}
