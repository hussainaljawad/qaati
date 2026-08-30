"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireActiveSubscription, requireAdmin } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { bhdToFils } from "@/lib/money";
import { parseDateOnly } from "@/lib/dates";
import { PLAN_PRESETS, splitByRatio } from "@/lib/payments/plan";
import {
  installmentSchema,
  planPresetSchema,
  recordPaymentSchema,
} from "@/lib/validation";
import { addDays } from "date-fns";

async function ownedBooking(orgId: string, bookingId: string) {
  return db.booking.findFirst({
    where: { id: bookingId, organizationId: orgId },
    select: {
      id: true,
      eventDate: true,
      totalAmountFils: true,
      discountFils: true,
    },
  });
}

/** يطبّق قالب خطة دفع على الحجز (يحذف الأقساط غير المدفوعة الحالية ويعيد بناءها). */
export async function applyPlanPresetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = planPresetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  const preset = PLAN_PRESETS.find((p) => p.id === parsed.data.presetId);
  if (!preset) return fail("قالب غير معروف");

  const booking = await ownedBooking(orgId, parsed.data.bookingId);
  if (!booking) return fail("الحجز غير موجود");

  const net = booking.totalAmountFils - booking.discountFils;
  if (net <= 0) return fail("حدّد قيمة الحجز أولاً");

  const amounts = splitByRatio(
    net,
    preset.parts.map((p) => p.ratio),
  );

  await db.$transaction([
    db.payment.deleteMany({
      where: { organizationId: orgId, bookingId: booking.id, status: "DUE" },
    }),
    db.payment.createMany({
      data: preset.parts.map((part, i) => ({
        organizationId: orgId,
        bookingId: booking.id,
        kind: part.kind,
        amountFils: amounts[i],
        dueDate: addDays(booking.eventDate, part.dueOffsetDays),
        status: "DUE" as const,
      })),
    }),
  ]);

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function addInstallmentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = installmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const booking = await ownedBooking(orgId, d.bookingId);
  if (!booking) return fail("الحجز غير موجود");

  await db.payment.create({
    data: {
      organizationId: orgId,
      bookingId: booking.id,
      kind: d.kind,
      amountFils: bhdToFils(d.amountBhd),
      dueDate: d.dueDate ? parseDateOnly(d.dueDate) : null,
      note: d.note ?? null,
      status: "DUE",
    },
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function recordPaymentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = recordPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const payment = await db.payment.findFirst({
    where: { id: d.paymentId, organizationId: orgId },
    select: { id: true, bookingId: true },
  });
  if (!payment) return fail("الدفعة غير موجودة");

  const paidAt = parseDateOnly(d.paidDate);
  if (!paidAt) return fail("تاريخ غير صحيح");

  await db.payment.update({
    where: { id: payment.id },
    data: {
      amountFils: bhdToFils(d.amountBhd),
      method: d.method,
      status: "PAID",
      paidAt,
      reference: d.reference ?? null,
      note: d.note ?? null,
      recordedById: session.user.id,
    },
  });

  revalidatePath(`/bookings/${payment.bookingId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteInstallmentAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const payment = await db.payment.findFirst({
    where: {
      id,
      organizationId: session.organization.id,
      status: { in: ["DUE"] },
    },
    select: { id: true, bookingId: true },
  });
  if (!payment) return;
  await db.payment.delete({ where: { id: payment.id } });
  revalidatePath(`/bookings/${payment.bookingId}`);
}

export async function waivePaymentAction(formData: FormData) {
  const session = await requireAdmin(); // إعفاء الدفعات قرار مالي — المالك فقط
  const id = String(formData.get("id") ?? "");
  const payment = await db.payment.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true, bookingId: true, status: true },
  });
  if (!payment) return;
  await db.payment.update({
    where: { id: payment.id },
    data: { status: payment.status === "WAIVED" ? "DUE" : "WAIVED" },
  });
  revalidatePath(`/bookings/${payment.bookingId}`);
}
