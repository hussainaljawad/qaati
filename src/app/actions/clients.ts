"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { clientSchema } from "@/lib/validation";
import { getClient } from "@/lib/clients/queries";

export async function createClientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const client = await db.client.create({
    data: {
      organizationId: session.organization.id,
      name: d.name,
      phone: d.phone,
      altPhone: d.altPhone ?? null,
      email: d.email ?? null,
      nationalId: d.nationalId ?? null,
      notes: d.notes ?? null,
      preferences: d.preferences ?? null,
    },
  });

  const next = String(formData.get("next") ?? "");
  revalidatePath("/clients");
  redirect(next.startsWith("/") ? next : `/clients/${client.id}`);
}

export async function updateClientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const existing = await getClient(session.organization.id, id);
  if (!existing) return fail("العميل غير موجود");

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  await db.client.update({
    where: { id },
    data: {
      name: d.name,
      phone: d.phone,
      altPhone: d.altPhone ?? null,
      email: d.email ?? null,
      nationalId: d.nationalId ?? null,
      notes: d.notes ?? null,
      preferences: d.preferences ?? null,
    },
  });

  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}
