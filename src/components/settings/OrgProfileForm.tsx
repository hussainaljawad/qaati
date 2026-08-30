"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { updateOrgProfileAction } from "@/app/actions/settings";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

type Org = {
  name: string;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
  crNumber: string | null;
};

export function OrgProfileForm({ org }: { org: Org }) {
  const [state, action, pending] = useActionState(
    updateOrgProfileAction,
    emptyForm,
  );
  const t = useTranslations("org");
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {state.message ? (
        <p className="rounded-lg bg-olive-soft px-3 py-2 text-xs font-medium text-olive">
          {state.message}
        </p>
      ) : null}

      <Field label={t("name")} error={fe.name}>
        <TextInput name="name" defaultValue={org.name} required />
      </Field>
      <Field label={t("phone")} error={fe.phone}>
        <TextInput name="phone" dir="ltr" defaultValue={org.phone ?? ""} />
      </Field>
      <Field label={t("address")} error={fe.address}>
        <Textarea name="address" rows={2} defaultValue={org.address ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("vatNumber")} error={fe.vatNumber}>
          <TextInput
            name="vatNumber"
            dir="ltr"
            defaultValue={org.vatNumber ?? ""}
          />
        </Field>
        <Field label={t("crNumber")} error={fe.crNumber}>
          <TextInput
            name="crNumber"
            dir="ltr"
            defaultValue={org.crNumber ?? ""}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("save")}
      </Button>
    </form>
  );
}
