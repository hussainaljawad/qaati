"use server";

import { revalidatePath } from "next/cache";
import { ReminderKind } from "@prisma/client";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";

/**
 * يسجّل إرسال رسالة واتساب (تذكير أو تأكيد) في سجل التواصل، ويُنشئ صف تذكير
 * إن كان له نوع محدّد. يُستدعى من زر "إرسال" في الواجهة قبل فتح رابط wa.me.
 */
export async function logWhatsappSendAction(input: {
  clientId: string;
  bookingId?: string;
  body: string;
  reminderKind?: keyof typeof ReminderKind;
}) {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const client = await db.client.findFirst({
    where: { id: input.clientId, organizationId: orgId },
    select: { id: true },
  });
  if (!client) return { ok: false };

  await db.communicationLog.create({
    data: {
      organizationId: orgId,
      clientId: input.clientId,
      bookingId: input.bookingId ?? null,
      type: "WHATSAPP",
      direction: "OUT",
      body: input.body,
      createdById: session.user.id,
    },
  });

  if (
    input.bookingId &&
    input.reminderKind &&
    input.reminderKind in ReminderKind
  ) {
    await db.reminder.create({
      data: {
        organizationId: orgId,
        bookingId: input.bookingId,
        kind: ReminderKind[input.reminderKind],
        channel: "WHATSAPP",
        scheduledFor: new Date(),
        sentAt: new Date(),
        status: "SENT",
        payloadText: input.body,
      },
    });
  }

  if (input.bookingId) revalidatePath(`/bookings/${input.bookingId}`);
  revalidatePath("/reminders");
  return { ok: true };
}
