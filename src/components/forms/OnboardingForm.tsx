"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  completeOnboardingAction,
  skipOnboardingAction,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";

const initial: OnboardingState = {};

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(
    completeOnboardingAction,
    initial,
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
      <h1 className="font-kufi text-xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

      <form action={action} className="mt-5 space-y-3">
        {state.error ? <FormError>{state.error}</FormError> : null}

        <Field label={t("hallNameLabel")}>
          <TextInput
            name="name"
            placeholder={t("hallNamePlaceholder")}
            required
          />
        </Field>

        <Field label={t("sectionLabel")}>
          <Select name="section" defaultValue="MIXED">
            <option value="MIXED">{t("sections.MIXED")}</option>
            <option value="MEN">{t("sections.MEN")}</option>
            <option value="WOMEN">{t("sections.WOMEN")}</option>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("capacityLabel")}>
            <TextInput
              name="capacitySeated"
              type="number"
              inputMode="numeric"
              min={1}
              dir="ltr"
            />
          </Field>
          <Field label={t("priceLabel")}>
            <TextInput
              name="basePriceBhd"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.001"
              dir="ltr"
            />
          </Field>
        </div>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "…" : t("finish")}
        </Button>
      </form>

      <form action={skipOnboardingAction} className="mt-3">
        <button
          type="submit"
          className="w-full py-2 text-center text-sm font-medium text-ink-soft hover:text-ink"
        >
          {tc("skip")}
        </button>
      </form>
    </div>
  );
}
