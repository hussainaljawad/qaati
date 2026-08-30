"use client";

import { useActionState, useState } from "react";
import { addWaitlistAction } from "@/app/actions/waitlist";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

type Hall = { id: string; name: string };
type ClientOption = { id: string; name: string; phone: string };

export function WaitlistForm({
  halls,
  clients,
}: {
  halls: Hall[];
  clients: ClientOption[];
}) {
  const [state, action, pending] = useActionState(addWaitlistAction, emptyForm);
  const [newClient, setNewClient] = useState(false);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3 p-4">
      {state.error ? <FormError>{state.error}</FormError> : null}

      {!newClient ? (
        <Field label="العميل" error={fe.clientId}>
          <Select name="clientId" defaultValue="">
            <option value="">— اختر —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="الاسم" error={fe.contactName}>
            <TextInput name="contactName" />
          </Field>
          <Field label="الجوال" error={fe.contactPhone}>
            <TextInput name="contactPhone" dir="ltr" inputMode="tel" />
          </Field>
        </div>
      )}
      <button
        type="button"
        onClick={() => setNewClient((v) => !v)}
        className="text-xs font-semibold text-gold"
      >
        {newClient ? "← عميل موجود" : "+ جهة اتصال جديدة"}
      </button>

      <Field label="القاعة" hint="اختياري" error={fe.hallId}>
        <Select name="hallId" defaultValue="">
          <option value="">أي قاعة</option>
          {halls.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="التاريخ المطلوب" error={fe.requestedDate}>
        <TextInput name="requestedDate" type="date" dir="ltr" required />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="flexible" className="size-4 accent-gold" />
        مرن على التاريخ
      </label>

      <Field label="ملاحظات" error={fe.notes}>
        <Textarea name="notes" rows={2} />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : "إضافة لقائمة الانتظار"}
      </Button>
    </form>
  );
}
