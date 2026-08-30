"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createBookingAction,
  updateBookingAction,
} from "@/app/actions/bookings";
import { emptyForm } from "@/lib/forms";
import { filsToBhd } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

const EVENT_TYPES = [
  "زفاف",
  "خطوبة",
  "ملكة",
  "تخرج",
  "عيد ميلاد",
  "عزاء",
  "اجتماع",
  "حفل",
];

type Hall = { id: string; name: string };
type ClientOption = { id: string; name: string; phone: string };

type CreateProps = {
  mode: "create";
  halls: Hall[];
  clients: ClientOption[];
  defaultDate?: string;
  defaultHallId?: string;
  defaultClientId?: string;
};

type EditProps = {
  mode: "edit";
  booking: {
    id: string;
    eventType: string;
    eventDate: string;
    startTime: string | null;
    endTime: string | null;
    guestsCount: number | null;
    totalAmountFils: number;
    discountFils: number;
    terms: string | null;
    notes: string | null;
    hallName: string;
    clientName: string;
  };
};

export function BookingForm(props: CreateProps | EditProps) {
  const isEdit = props.mode === "edit";
  const t = useTranslations("bookingForm");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(
    isEdit ? updateBookingAction : createBookingAction,
    emptyForm,
  );

  const [newClient, setNewClient] = useState(false);
  const [status, setStatus] = useState<"HOLD" | "CONFIRMED">("HOLD");

  const fe = state.fieldErrors ?? {};
  const b = isEdit ? props.booking : null;

  return (
    <form action={action} className="space-y-4 p-4">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {isEdit ? <input type="hidden" name="id" value={b!.id} /> : null}

      {!isEdit ? (
        <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <legend className="px-1 font-kufi text-sm font-bold text-ink">
            {t("clientSection")}
          </legend>

          {!newClient ? (
            <Field label={t("pickClient")} error={fe.clientId}>
              <Select
                name="clientId"
                defaultValue={props.defaultClientId ?? ""}
                required={!newClient}
              >
                <option value="">{t("choose")}</option>
                {props.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("clientName")} error={fe.newClientName}>
                <TextInput name="newClientName" required={newClient} />
              </Field>
              <Field label={t("phone")} error={fe.newClientPhone}>
                <TextInput
                  name="newClientPhone"
                  dir="ltr"
                  inputMode="tel"
                  required={newClient}
                />
              </Field>
            </div>
          )}

          <button
            type="button"
            onClick={() => setNewClient((v) => !v)}
            className="text-xs font-semibold text-gold"
          >
            {newClient ? t("pickExisting") : t("newClient")}
          </button>
        </fieldset>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4 text-sm text-ink-soft">
          {t.rich("summary", {
            client: b!.clientName,
            hall: b!.hallName,
            b: (c) => <b className="text-ink">{c}</b>,
          })}
        </div>
      )}

      <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
        <legend className="px-1 font-kufi text-sm font-bold text-ink">
          {t("eventSection")}
        </legend>

        {!isEdit ? (
          <Field label={t("hall")} error={fe.hallId}>
            <Select
              name="hallId"
              defaultValue={props.defaultHallId ?? ""}
              required
            >
              <option value="">{t("choose")}</option>
              {props.halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field label={t("eventType")} error={fe.eventType}>
          <TextInput
            name="eventType"
            list="event-types"
            defaultValue={b?.eventType ?? ""}
            required
          />
          <datalist id="event-types">
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>

        <Field label={t("date")} error={fe.eventDate}>
          <TextInput
            name="eventDate"
            type="date"
            dir="ltr"
            defaultValue={isEdit ? b!.eventDate : props.defaultDate}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("startTime")} error={fe.startTime}>
            <TextInput
              name="startTime"
              type="time"
              dir="ltr"
              defaultValue={b?.startTime ?? ""}
            />
          </Field>
          <Field label={t("endTime")} error={fe.endTime}>
            <TextInput
              name="endTime"
              type="time"
              dir="ltr"
              defaultValue={b?.endTime ?? ""}
            />
          </Field>
        </div>

        <Field label={t("guests")} error={fe.guestsCount}>
          <TextInput
            name="guestsCount"
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={1}
            defaultValue={b?.guestsCount ?? ""}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
        <legend className="px-1 font-kufi text-sm font-bold text-ink">
          {t("priceSection")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("total")} error={fe.totalBhd}>
            <TextInput
              name="totalBhd"
              type="number"
              inputMode="decimal"
              dir="ltr"
              min={0}
              step="0.001"
              defaultValue={b ? filsToBhd(b.totalAmountFils) || "" : ""}
            />
          </Field>
          <Field label={t("discount")} error={fe.discountBhd}>
            <TextInput
              name="discountBhd"
              type="number"
              inputMode="decimal"
              dir="ltr"
              min={0}
              step="0.001"
              defaultValue={b ? filsToBhd(b.discountFils) || "" : ""}
            />
          </Field>
        </div>
      </fieldset>

      {!isEdit ? (
        <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <legend className="px-1 font-kufi text-sm font-bold text-ink">
            {t("statusSection")}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(["HOLD", "CONFIRMED"] as const).map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                  status === s
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="sr-only"
                />
                {s === "HOLD" ? t("hold") : t("confirmed")}
              </label>
            ))}
          </div>
          {status === "HOLD" ? (
            <Field label={t("holdDays")} error={fe.holdDays}>
              <TextInput
                name="holdDays"
                type="number"
                inputMode="numeric"
                dir="ltr"
                min={1}
                max={60}
                defaultValue={7}
              />
            </Field>
          ) : null}
        </fieldset>
      ) : null}

      <fieldset className="space-y-3 rounded-[var(--radius-card)] border border-line bg-paper p-4">
        <legend className="px-1 font-kufi text-sm font-bold text-ink">
          {t("detailsSection")}
        </legend>
        <Field label={t("terms")} error={fe.terms}>
          <Textarea name="terms" defaultValue={b?.terms ?? ""} rows={3} />
        </Field>
        <Field label={t("notes")} error={fe.notes}>
          <Textarea name="notes" defaultValue={b?.notes ?? ""} rows={2} />
        </Field>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("sending") : isEdit ? t("saveEdits") : t("create")}
      </Button>
    </form>
  );
}
