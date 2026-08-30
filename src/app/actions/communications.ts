"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { clientTagsSchema, communicationSchema } from "@/lib/validation";

export async function addCommunicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = communicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const client = await db.client.findFirst({
    where: { id: d.clientId, organizationId: orgId },
    select: { id: true },
  });
  if (!client) return fail("العميل غير موجود");

  await db.communicationLog.create({
    data: {
      organizationId: orgId,
      clientId: d.clientId,
      bookingId: d.bookingId ?? null,
      type: d.type,
      direction: d.type === "CALL" || d.type === "MEETING" ? null : "OUT",
      body: d.body,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/clients/${d.clientId}`);
  if (d.bookingId) revalidatePath(`/bookings/${d.bookingId}`);
  return { ok: true };
}

export async function deleteCommunicationAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const log = await db.communicationLog.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true, clientId: true },
  });
  if (!log) return;
  await db.communicationLog.delete({ where: { id } });
  revalidatePath(`/clients/${log.clientId}`);
}

export async function updateClientTagsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const parsed = clientTagsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const client = await db.client.findFirst({
    where: {
      id: parsed.data.clientId,
      organizationId: session.organization.id,
    },
    select: { id: true },
  });
  if (!client) return fail("العميل غير موجود");

  const tags = Array.from(
    new Set(
      parsed.data.tags
        .split(/[,،\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );

  await db.client.update({ where: { id: client.id }, data: { tags } });
  revalidatePath(`/clients/${client.id}`);
  return { ok: true };
}
