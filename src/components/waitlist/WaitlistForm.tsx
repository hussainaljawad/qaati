"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("waitlist.form");
  const tf = useTranslations("bookingForm");
  const [state, action, pending] = useActionState(addWaitlistAction, emptyForm);
  const [newClient, setNewClient] = useState(false);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3 p-4">
      {state.error ? <FormError>{state.error}</FormError> : null}

      {!newClient ? (
        <Field label={t("client")} error={fe.clientId}>
          <Select name="clientId" defaultValue="">
            <option value="">{tf("choose")}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("name")} error={fe.contactName}>
            <TextInput name="contactName" />
          </Field>
          <Field label={t("phone")} error={fe.contactPhone}>
            <TextInput name="contactPhone" dir="ltr" inputMode="tel" />
          </Field>
        </div>
      )}
      <button
        type="button"
        onClick={() => setNewClient((v) => !v)}
        className="text-xs font-semibold text-gold"
      >
        {newClient ? t("existingClient") : t("newContact")}
      </button>

      <Field label={t("hall")} error={fe.hallId}>
        <Select name="hallId" defaultValue="">
          <option value="">{t("anyHall")}</option>
          {halls.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("date")} error={fe.requestedDate}>
        <TextInput name="requestedDate" type="date" dir="ltr" required />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="flexible" className="size-4 accent-gold" />
        {t("flexibleLabel")}
      </label>

      <Field label={t("notes")} error={fe.notes}>
        <Textarea name="notes" rows={2} />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : t("add")}
      </Button>
    </form>
  );
}
