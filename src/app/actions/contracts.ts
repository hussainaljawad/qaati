"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { buildContractDoc, contractNumberFor } from "@/lib/contracts/render";
import { contractSignSchema, contractTermsSchema } from "@/lib/validation";

/** ينشئ عقداً من حجز (أو يفتح الموجود). */
export async function generateContractAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const bookingId = String(formData.get("bookingId") ?? "");

  const existing = await db.contract.findFirst({
    where: { organizationId: orgId, bookingId },
    select: { id: true },
  });
  if (existing) redirect(`/contracts/${existing.id}`);

  const booking = await db.booking.findFirst({
    where: { id: bookingId, organizationId: orgId },
    select: { id: true, reference: true },
  });
  if (!booking) return;

  const doc = await buildContractDoc(orgId, bookingId);
  if (!doc) return;

  const contract = await db.contract.create({
    data: {
      organizationId: orgId,
      bookingId: booking.id,
      contractNumber: contractNumberFor(booking.reference),
      templateVersion: "v1",
      bodySnapshot: doc as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/bookings/${booking.id}`);
  redirect(`/contracts/${contract.id}`);
}

export async function updateContractTermsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const parsed = contractTermsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const contract = await db.contract.findFirst({
    where: {
      id: parsed.data.contractId,
      organizationId: session.organization.id,
    },
  });
  if (!contract) return fail("العقد غير موجود");
  if (contract.signedAt) return fail("لا يمكن تعديل عقد موقّع");

  const body = {
    ...(contract.bodySnapshot as object),
    terms: parsed.data.terms,
  } as unknown as Prisma.InputJsonValue;
  await db.contract.update({
    where: { id: contract.id },
    data: { bodySnapshot: body },
  });

  revalidatePath(`/contracts/${contract.id}`);
  return { ok: true };
}

export async function signContractAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const parsed = contractSignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const contract = await db.contract.findFirst({
    where: {
      id: parsed.data.contractId,
      organizationId: session.organization.id,
    },
    select: { id: true, signedAt: true },
  });
  if (!contract) return fail("العقد غير موجود");
  if (contract.signedAt) return fail("العقد موقّع مسبقاً");

  await db.contract.update({
    where: { id: contract.id },
    data: { signedAt: new Date(), signedByName: parsed.data.signedByName },
  });

  revalidatePath(`/contracts/${contract.id}`);
  return { ok: true };
}
