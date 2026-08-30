"use client";

import { useActionState } from "react";
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
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {state.message ? (
        <p className="rounded-lg bg-olive-soft px-3 py-2 text-xs font-medium text-olive">
          {state.message}
        </p>
      ) : null}

      <Field label="اسم المنشأة" error={fe.name}>
        <TextInput name="name" defaultValue={org.name} required />
      </Field>
      <Field label="الهاتف" error={fe.phone}>
        <TextInput name="phone" dir="ltr" defaultValue={org.phone ?? ""} />
      </Field>
      <Field label="العنوان" error={fe.address}>
        <Textarea name="address" rows={2} defaultValue={org.address ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="الرقم الضريبي (VAT)" error={fe.vatNumber}>
          <TextInput
            name="vatNumber"
            dir="ltr"
            defaultValue={org.vatNumber ?? ""}
          />
        </Field>
        <Field label="السجل التجاري" error={fe.crNumber}>
          <TextInput
            name="crNumber"
            dir="ltr"
            defaultValue={org.crNumber ?? ""}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "…" : "حفظ"}
      </Button>
    </form>
  );
}
