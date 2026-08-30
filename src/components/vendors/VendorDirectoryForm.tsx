"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";

import { createVendorAction } from "@/app/actions/vendors";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

export function VendorDirectoryForm() {
  const [state, action, pending] = useActionState(
    createVendorAction,
    emptyForm,
  );
  const t = useTranslations("vendors.form");
  const tv = useTranslations("vendors");
  const catLabels = getLabels(useLocale() as Locale).vendorCategory;
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4"
    >
      <h3 className="font-kufi text-sm font-bold text-ink">
        {tv("addToDirectory")}
      </h3>
      {state.error ? <FormError>{state.error}</FormError> : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("category")} error={fe.category}>
          <Select name="category" defaultValue="CATERING">
            {Object.entries(catLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("name")} error={fe.name}>
          <TextInput name="name" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("phone")} error={fe.phone}>
          <TextInput name="phone" dir="ltr" inputMode="tel" />
        </Field>
        <Field label={t("contact")} error={fe.contactPerson}>
          <TextInput name="contactPerson" />
        </Field>
      </div>
      <Field label={t("notes")} error={fe.notes}>
        <Textarea name="notes" rows={2} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("add")}
      </Button>
    </form>
  );
}
