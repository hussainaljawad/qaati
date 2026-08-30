"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";

import { createHallAction, updateHallAction } from "@/app/actions/halls";
import { emptyForm } from "@/lib/forms";
import { filsToBhd } from "@/lib/money";
import { HALL_COLORS } from "@/lib/halls/queries";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

type Hall = {
  id: string;
  name: string;
  nameEn: string | null;
  section: "MEN" | "WOMEN" | "MIXED";
  capacitySeated: number | null;
  capacityStanding: number | null;
  basePriceFils: number;
  color: string;
  notes: string | null;
  isActive: boolean;
};

export function HallForm({ hall }: { hall?: Hall }) {
  const isEdit = Boolean(hall);
  const t = useTranslations("halls.form");
  const tc = useTranslations("common");
  const sectionLabels = getLabels(useLocale() as Locale).hallSection;
  const [state, action, pending] = useActionState(
    isEdit ? updateHallAction : createHallAction,
    emptyForm,
  );
  const [color, setColor] = useState(hall?.color ?? HALL_COLORS[0]);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3 p-4">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {isEdit ? <input type="hidden" name="id" value={hall!.id} /> : null}
      <input type="hidden" name="color" value={color} />

      <Field label={t("name")} error={fe.name}>
        <TextInput name="name" defaultValue={hall?.name ?? ""} required />
      </Field>

      <Field label={t("nameEn")} hint={tc("optional")} error={fe.nameEn}>
        <TextInput name="nameEn" dir="ltr" defaultValue={hall?.nameEn ?? ""} />
      </Field>

      <Field label={t("section")} error={fe.section}>
        <Select name="section" defaultValue={hall?.section ?? "MIXED"}>
          <option value="MIXED">{sectionLabels.MIXED}</option>
          <option value="MEN">{sectionLabels.MEN}</option>
          <option value="WOMEN">{sectionLabels.WOMEN}</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("seated")} error={fe.capacitySeated}>
          <TextInput
            name="capacitySeated"
            type="number"
            dir="ltr"
            min={1}
            defaultValue={hall?.capacitySeated ?? ""}
          />
        </Field>
        <Field label={t("standing")} error={fe.capacityStanding}>
          <TextInput
            name="capacityStanding"
            type="number"
            dir="ltr"
            min={1}
            defaultValue={hall?.capacityStanding ?? ""}
          />
        </Field>
      </div>

      <Field label={t("basePrice")} error={fe.basePriceBhd}>
        <TextInput
          name="basePriceBhd"
          type="number"
          dir="ltr"
          min={0}
          step="0.001"
          defaultValue={hall ? filsToBhd(hall.basePriceFils) || "" : ""}
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink">
          {t("color")}
        </span>
        <div className="flex gap-2">
          {HALL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`size-8 rounded-full border-2 ${
                color === c ? "border-ink" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <Field label={t("notes")} error={fe.notes}>
        <Textarea name="notes" rows={2} defaultValue={hall?.notes ?? ""} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={hall?.isActive ?? true}
          className="size-4 accent-gold"
        />
        {t("active")}
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : isEdit ? t("save") : t("add")}
      </Button>
    </form>
  );
}
