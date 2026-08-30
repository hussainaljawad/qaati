"use client";

import { useActionState, useState } from "react";
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

      <Field label="اسم القاعة" error={fe.name}>
        <TextInput name="name" defaultValue={hall?.name ?? ""} required />
      </Field>

      <Field label="الاسم بالإنجليزي" hint="اختياري" error={fe.nameEn}>
        <TextInput name="nameEn" dir="ltr" defaultValue={hall?.nameEn ?? ""} />
      </Field>

      <Field label="القسم" error={fe.section}>
        <Select name="section" defaultValue={hall?.section ?? "MIXED"}>
          <option value="MIXED">مشترك</option>
          <option value="MEN">رجال</option>
          <option value="WOMEN">نساء</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="سعة الجلوس" error={fe.capacitySeated}>
          <TextInput
            name="capacitySeated"
            type="number"
            dir="ltr"
            min={1}
            defaultValue={hall?.capacitySeated ?? ""}
          />
        </Field>
        <Field label="سعة الوقوف" error={fe.capacityStanding}>
          <TextInput
            name="capacityStanding"
            type="number"
            dir="ltr"
            min={1}
            defaultValue={hall?.capacityStanding ?? ""}
          />
        </Field>
      </div>

      <Field label="السعر الأساسي (د.ب)" error={fe.basePriceBhd}>
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
          لون التقويم
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

      <Field label="ملاحظات" error={fe.notes}>
        <Textarea name="notes" rows={2} defaultValue={hall?.notes ?? ""} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={hall?.isActive ?? true}
          className="size-4 accent-gold"
        />
        القاعة مفعّلة (تظهر في الحجوزات والتقويم)
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : isEdit ? "حفظ" : "إضافة القاعة"}
      </Button>
    </form>
  );
}
