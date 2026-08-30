"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WaitlistStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { parseDateOnly } from "@/lib/dates";
import { waitlistSchema } from "@/lib/validation";

export async function addWaitlistAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const requestedDate = parseDateOnly(d.requestedDate);
  if (!requestedDate) return fail("تاريخ غير صحيح");

  if (d.clientId) {
    const c = await db.client.findFirst({
      where: { id: d.clientId, organizationId: orgId },
      select: { id: true },
    });
    if (!c) return fail("العميل غير موجود");
  }
  if (d.hallId) {
    const h = await db.hall.findFirst({
      where: { id: d.hallId, organizationId: orgId },
      select: { id: true },
    });
    if (!h) return fail("القاعة غير موجودة");
  }

  await db.waitlistEntry.create({
    data: {
      organizationId: orgId,
      clientId: d.clientId ?? null,
      contactName: d.clientId ? null : (d.contactName ?? null),
      contactPhone: d.clientId ? null : (d.contactPhone ?? null),
      hallId: d.hallId ?? null,
      requestedDate,
      flexible: d.flexible,
      notes: d.notes ?? null,
    },
  });

  revalidatePath("/waitlist");
  redirect("/waitlist");
}

export async function setWaitlistStatusAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!Object.values(WaitlistStatus).includes(status as WaitlistStatus)) return;

  const entry = await db.waitlistEntry.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true },
  });
  if (!entry) return;

  await db.waitlistEntry.update({
    where: { id },
    data: { status: status as WaitlistStatus },
  });
  revalidatePath("/waitlist");
}
