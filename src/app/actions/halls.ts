"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { bhdToFils } from "@/lib/money";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { hallSchema } from "@/lib/validation";
import { getHall } from "@/lib/halls/queries";

function parse(formData: FormData) {
  return hallSchema.safeParse({
    ...Object.fromEntries(formData),
    isActive: formData.get("isActive") ?? "on",
  });
}

export async function createHallAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const maxSort = await db.hall.aggregate({
    _max: { sortOrder: true },
    where: { organizationId: session.organization.id },
  });

  await db.hall.create({
    data: {
      organizationId: session.organization.id,
      name: d.name,
      nameEn: d.nameEn ?? null,
      section: d.section,
      capacitySeated: d.capacitySeated ? Math.round(d.capacitySeated) : null,
      capacityStanding: d.capacityStanding
        ? Math.round(d.capacityStanding)
        : null,
      basePriceFils: d.basePriceBhd ? bhdToFils(d.basePriceBhd) : 0,
      color: d.color,
      notes: d.notes ?? null,
      isActive: d.isActive,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/settings/halls");
  redirect("/settings/halls");
}

export async function updateHallAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getHall(session.organization.id, id);
  if (!existing) return fail("القاعة غير موجودة");

  const parsed = parse(formData);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  await db.hall.update({
    where: { id },
    data: {
      name: d.name,
      nameEn: d.nameEn ?? null,
      section: d.section,
      capacitySeated: d.capacitySeated ? Math.round(d.capacitySeated) : null,
      capacityStanding: d.capacityStanding
        ? Math.round(d.capacityStanding)
        : null,
      basePriceFils: d.basePriceBhd ? bhdToFils(d.basePriceBhd) : 0,
      color: d.color,
      notes: d.notes ?? null,
      isActive: d.isActive,
    },
  });

  revalidatePath("/settings/halls");
  redirect("/settings/halls");
}

export async function toggleHallActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const hall = await getHall(session.organization.id, id);
  if (!hall) return;
  await db.hall.update({ where: { id }, data: { isActive: !hall.isActive } });
  revalidatePath("/settings/halls");
}
