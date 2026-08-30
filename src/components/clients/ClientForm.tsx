"use client";

import { useActionState } from "react";
import { createClientAction, updateClientAction } from "@/app/actions/clients";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

type Client = {
  id: string;
  name: string;
  phone: string;
  altPhone: string | null;
  email: string | null;
  nationalId: string | null;
  notes: string | null;
  preferences: string | null;
};

export function ClientForm({
  client,
  next,
}: {
  client?: Client;
  next?: string;
}) {
  const isEdit = Boolean(client);
  const [state, action, pending] = useActionState(
    isEdit ? updateClientAction : createClientAction,
    emptyForm,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3 p-4">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {isEdit ? <input type="hidden" name="id" value={client!.id} /> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field label="الاسم" error={fe.name}>
        <TextInput name="name" defaultValue={client?.name ?? ""} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="الجوال (واتساب)" error={fe.phone}>
          <TextInput
            name="phone"
            dir="ltr"
            inputMode="tel"
            defaultValue={client?.phone ?? ""}
            required
          />
        </Field>
        <Field label="جوال آخر" error={fe.altPhone}>
          <TextInput
            name="altPhone"
            dir="ltr"
            inputMode="tel"
            defaultValue={client?.altPhone ?? ""}
          />
        </Field>
      </div>

      <Field label="البريد الإلكتروني" error={fe.email}>
        <TextInput
          name="email"
          type="email"
          dir="ltr"
          defaultValue={client?.email ?? ""}
        />
      </Field>

      <Field label="الرقم الشخصي" error={fe.nationalId}>
        <TextInput
          name="nationalId"
          dir="ltr"
          defaultValue={client?.nationalId ?? ""}
        />
      </Field>

      <Field label="تفضيلات العميل" error={fe.preferences}>
        <Textarea
          name="preferences"
          rows={2}
          defaultValue={client?.preferences ?? ""}
        />
      </Field>

      <Field label="ملاحظات" error={fe.notes}>
        <Textarea name="notes" rows={2} defaultValue={client?.notes ?? ""} />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : isEdit ? "حفظ" : "إضافة العميل"}
      </Button>
    </form>
  );
}
