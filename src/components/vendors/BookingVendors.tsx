"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  addBookingVendorAction,
  deleteBookingVendorAction,
  setBookingVendorStatusAction,
} from "@/app/actions/vendors";
import { emptyForm } from "@/lib/forms";
import { formatMoney } from "@/lib/money";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";
import { waLink } from "@/lib/notifications/whatsapp";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";

type BV = {
  id: string;
  category:
    | "CATERING"
    | "PHOTOGRAPHY"
    | "DECOR"
    | "DJ"
    | "FLOWERS"
    | "LIGHTING"
    | "SECURITY"
    | "OTHER";
  name: string;
  phone: string | null;
  contactPerson: string | null;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  costFils: number | null;
  notes: string | null;
};

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "olive",
  DECLINED: "wine",
} as const;

export function BookingVendors({
  bookingId,
  vendors,
  directory,
  locale,
}: {
  bookingId: string;
  vendors: BV[];
  directory: {
    id: string;
    name: string;
    category: string;
    phone: string | null;
  }[];
  locale: Locale;
}) {
  const t = useTranslations("vendors");
  const tc = useTranslations("common");
  const labels = getLabels(locale);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
      <h3 className="mb-2 font-kufi text-sm font-bold text-ink">
        {t("sectionTitle")}
      </h3>

      {vendors.length === 0 ? (
        <p className="mb-2 text-xs text-ink-soft">{t("none")}</p>
      ) : (
        <ul className="mb-2 space-y-2">
          {vendors.map((v) => (
            <li key={v.id} className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {labels.vendorCategory[v.category]} · {v.name}
                  </p>
                  <p className="text-[11px] text-ink-soft">
                    {[v.contactPerson, v.phone].filter(Boolean).join(" · ")}
                    {v.costFils
                      ? ` · ${formatMoney(v.costFils, locale, { compact: true })}`
                      : ""}
                  </p>
                  {v.notes ? (
                    <p className="mt-1 text-[11px] text-ink-soft">{v.notes}</p>
                  ) : null}
                </div>
                <Badge tone={STATUS_TONE[v.status]}>
                  {labels.vendorStatus[v.status]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold">
                {v.phone ? (
                  <a
                    href={waLink(
                      v.phone,
                      `مرحباً، بخصوص خدمة ${getLabels("ar").vendorCategory[v.category]} لمناسبة عميلنا.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-olive"
                  >
                    {tc("whatsapp")}
                  </a>
                ) : null}
                {(["PENDING", "CONFIRMED", "DECLINED"] as const)
                  .filter((s) => s !== v.status)
                  .map((s) => (
                    <form key={s} action={setBookingVendorStatusAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className="text-ink-soft">
                        {labels.vendorStatus[s]}
                      </button>
                    </form>
                  ))}
                <form action={deleteBookingVendorAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" className="text-wine">
                    {tc("delete")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <AddForm
          bookingId={bookingId}
          directory={directory}
          onDone={() => setOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold text-gold"
        >
          <Plus className="size-4" /> {t("add")}
        </button>
      )}
    </div>
  );
}

function AddForm({
  bookingId,
  directory,
  onDone,
}: {
  bookingId: string;
  directory: {
    id: string;
    name: string;
    category: string;
    phone: string | null;
  }[];
  onDone: () => void;
}) {
  const t = useTranslations("vendors.form");
  const tc = useTranslations("common");
  const catLabels = getLabels(useLocale() as Locale).vendorCategory;
  const [state, action, pending] = useActionState(
    addBookingVendorAction,
    emptyForm,
  );
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="mt-2 space-y-2 rounded-xl border border-line bg-paper-2/40 p-3"
    >
      {state.error ? <FormError>{state.error}</FormError> : null}
      <input type="hidden" name="bookingId" value={bookingId} />

      <div className="grid grid-cols-2 gap-2">
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
          <TextInput name="name" list="vendor-dir" required />
          <datalist id="vendor-dir">
            {directory.map((d) => (
              <option key={d.id} value={d.name} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t("phone")} error={fe.phone}>
          <TextInput name="phone" dir="ltr" inputMode="tel" />
        </Field>
        <Field label={t("contact")} error={fe.contactPerson}>
          <TextInput name="contactPerson" />
        </Field>
      </div>
      <Field label={t("cost")} error={fe.costBhd}>
        <TextInput
          name="costBhd"
          type="number"
          dir="ltr"
          step="0.001"
          min={0}
        />
      </Field>
      <Field label={t("notes")} error={fe.notes}>
        <Textarea name="notes" rows={2} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-ink">
        <input
          type="checkbox"
          name="saveToDirectory"
          className="size-4 accent-gold"
        />
        {t("saveToDirectory")}
      </label>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? "…" : t("add")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onDone}
          className="flex-1"
        >
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
