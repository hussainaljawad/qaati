"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";

import { addTeamMemberAction } from "@/app/actions/settings";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";

export function TeamMemberForm() {
  const [state, action, pending] = useActionState(
    addTeamMemberAction,
    emptyForm,
  );
  const t = useTranslations("team.form");
  const tt = useTranslations("team");
  const tp = useTranslations("auth");
  const roleLabels = getLabels(useLocale() as Locale).userRole;
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4"
    >
      <h3 className="font-kufi text-sm font-bold text-ink">{tt("addTitle")}</h3>
      {state.error ? <FormError>{state.error}</FormError> : null}

      <Field label={t("name")} error={fe.name}>
        <TextInput name="name" required />
      </Field>
      <Field label={t("email")} error={fe.email}>
        <TextInput name="email" type="email" dir="ltr" required />
      </Field>
      <Field
        label={t("tempPassword")}
        hint={tp("passwordHint")}
        error={fe.password}
      >
        <TextInput
          name="password"
          type="text"
          dir="ltr"
          minLength={8}
          required
        />
      </Field>
      <Field label={t("role")} error={fe.role}>
        <Select name="role" defaultValue="STAFF">
          <option value="STAFF">{roleLabels.STAFF}</option>
          <option value="ADMIN">{roleLabels.ADMIN}</option>
        </Select>
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("add")}
      </Button>
    </form>
  );
}
