"use client";

import { useActionState } from "react";
import { createVendorAction } from "@/app/actions/vendors";
import { emptyForm } from "@/lib/forms";
import { VENDOR_CATEGORY_LABEL } from "@/lib/vendors/queries";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

export function VendorDirectoryForm() {
  const [state, action, pending] = useActionState(
    createVendorAction,
    emptyForm,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4"
    >
      <h3 className="font-kufi text-sm font-bold text-ink">
        إضافة مورد للدليل
      </h3>
      {state.error ? <FormError>{state.error}</FormError> : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="الفئة" error={fe.category}>
          <Select name="category" defaultValue="CATERING">
            {Object.entries(VENDOR_CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="الاسم" error={fe.name}>
          <TextInput name="name" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="الجوال" error={fe.phone}>
          <TextInput name="phone" dir="ltr" inputMode="tel" />
        </Field>
        <Field label="جهة الاتصال" error={fe.contactPerson}>
          <TextInput name="contactPerson" />
        </Field>
      </div>
      <Field label="ملاحظات" error={fe.notes}>
        <Textarea name="notes" rows={2} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : "إضافة"}
      </Button>
    </form>
  );
}
