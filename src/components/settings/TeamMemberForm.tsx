"use client";

import { useActionState } from "react";
import { addTeamMemberAction } from "@/app/actions/settings";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";

export function TeamMemberForm() {
  const [state, action, pending] = useActionState(
    addTeamMemberAction,
    emptyForm,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4"
    >
      <h3 className="font-kufi text-sm font-bold text-ink">إضافة موظف</h3>
      {state.error ? <FormError>{state.error}</FormError> : null}

      <Field label="الاسم" error={fe.name}>
        <TextInput name="name" required />
      </Field>
      <Field label="البريد الإلكتروني" error={fe.email}>
        <TextInput name="email" type="email" dir="ltr" required />
      </Field>
      <Field
        label="كلمة مرور مؤقتة"
        hint="٨ أحرف على الأقل"
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
      <Field label="الصلاحية" error={fe.role}>
        <Select name="role" defaultValue="STAFF">
          <option value="STAFF">موظف استقبال</option>
          <option value="ADMIN">مالك / مدير</option>
        </Select>
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "…" : "إضافة"}
      </Button>
    </form>
  );
}
