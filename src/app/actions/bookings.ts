"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { bhdToFils } from "@/lib/money";
import { parseDateOnly } from "@/lib/dates";
import {
  BookingConflictError,
  expireStaleHolds,
  findDateConflict,
  isDbConflictError,
} from "@/lib/bookings/conflict";
import { nextBookingReference } from "@/lib/bookings/reference";
import { canTransition, reactivates } from "@/lib/bookings/status";
import {
  bookingEditSchema,
  bookingSchema,
  bookingTransitionSchema,
} from "@/lib/validation";

const DEFAULT_HOLD_DAYS = 7;

export async function createBookingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const eventDate = parseDateOnly(d.eventDate);
  if (!eventDate) return fail("تاريخ غير صحيح");

  // القاعة تخص المنشأة؟
  const hall = await db.hall.findFirst({
    where: { id: d.hallId, organizationId: orgId },
  });
  if (!hall) return fail("القاعة غير موجودة");

  let bookingId: string;
  try {
    bookingId = await db.$transaction(async (tx) => {
      await expireStaleHolds(tx, orgId);

      const conflict = await findDateConflict(tx, {
        organizationId: orgId,
        hallId: d.hallId,
        eventDate,
      });
      if (conflict) {
        throw new BookingConflictError({
          reference: conflict.reference,
          clientName: conflict.client.name,
          hallName: conflict.hall.name,
        });
      }

      // العميل: موجود أو جديد
      let clientId = d.clientId ?? "";
      if (clientId) {
        const c = await tx.client.findFirst({
          where: { id: clientId, organizationId: orgId },
          select: { id: true },
        });
        if (!c) throw new Error("العميل غير موجود");
      } else {
        const created = await tx.client.create({
          data: {
            organizationId: orgId,
            name: d.newClientName!,
            phone: d.newClientPhone!,
          },
        });
        clientId = created.id;
      }

      const reference = await nextBookingReference(tx, orgId);
      const totalFils = d.totalBhd ? bhdToFils(d.totalBhd) : 0;
      const discountFils = d.discountBhd ? bhdToFils(d.discountBhd) : 0;

      const booking = await tx.booking.create({
        data: {
          organizationId: orgId,
          hallId: d.hallId,
          clientId,
          createdById: session.user.id,
          reference,
          eventType: d.eventType,
          eventDate,
          startTime: d.startTime ?? null,
          endTime: d.endTime ?? null,
          status: d.status,
          holdExpiresAt:
            d.status === "HOLD"
              ? addDays(
                  new Date(),
                  d.holdDays ? Math.round(d.holdDays) : DEFAULT_HOLD_DAYS,
                )
              : null,
          guestsCount: d.guestsCount ? Math.round(d.guestsCount) : null,
          totalAmountFils: totalFils,
          discountFils,
          terms: d.terms ?? null,
          notes: d.notes ?? null,
        },
      });
      return booking.id;
    });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return fail(
        `هذا اليوم محجوز على «${err.conflict.hallName}» — حجز ${err.conflict.reference} لـ ${err.conflict.clientName}.`,
      );
    }
    if (isDbConflictError(err)) {
      return fail("هذا اليوم محجوز على هذه القاعة. اختر تاريخاً أو قاعة أخرى.");
    }
    if (err instanceof Error && err.message.includes("العميل")) {
      return fail(err.message);
    }
    console.error("createBooking failed", err);
    return fail("صار خطأ. جرّب مرة ثانية.");
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect(`/bookings/${bookingId}`);
}

export async function updateBookingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const id = String(formData.get("id") ?? "");

  const existing = await db.booking.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!existing) return fail("الحجز غير موجود");
  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    return fail("لا يمكن تعديل حجز مكتمل أو ملغي");
  }

  const parsed = bookingEditSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const eventDate = parseDateOnly(d.eventDate);
  if (!eventDate) return fail("تاريخ غير صحيح");

  try {
    await db.$transaction(async (tx) => {
      await expireStaleHolds(tx, orgId);
      if (eventDate.getTime() !== existing.eventDate.getTime()) {
        const conflict = await findDateConflict(tx, {
          organizationId: orgId,
          hallId: existing.hallId,
          eventDate,
          excludeBookingId: id,
        });
        if (conflict) {
          throw new BookingConflictError({
            reference: conflict.reference,
            clientName: conflict.client.name,
            hallName: conflict.hall.name,
          });
        }
      }
      await tx.booking.update({
        where: { id },
        data: {
          eventType: d.eventType,
          eventDate,
          startTime: d.startTime ?? null,
          endTime: d.endTime ?? null,
          guestsCount: d.guestsCount ? Math.round(d.guestsCount) : null,
          totalAmountFils: d.totalBhd ? bhdToFils(d.totalBhd) : 0,
          discountFils: d.discountBhd ? bhdToFils(d.discountBhd) : 0,
          terms: d.terms ?? null,
          notes: d.notes ?? null,
        },
      });
    });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return fail(`التاريخ الجديد محجوز — حجز ${err.conflict.reference}.`);
    }
    if (isDbConflictError(err))
      return fail("التاريخ الجديد محجوز على هذه القاعة.");
    console.error("updateBooking failed", err);
    return fail("صار خطأ. جرّب مرة ثانية.");
  }

  revalidatePath(`/bookings/${id}`);
  revalidatePath("/calendar");
  redirect(`/bookings/${id}`);
}

export async function transitionBookingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = bookingTransitionSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return fromZod(parsed.error);
  const { bookingId, to, cancellationReason } = parsed.data;

  const booking = await db.booking.findFirst({
    where: { id: bookingId, organizationId: orgId },
  });
  if (!booking) return fail("الحجز غير موجود");
  if (!canTransition(booking.status, to)) {
    return fail("هذا الانتقال غير مسموح");
  }

  try {
    await db.$transaction(async (tx) => {
      await expireStaleHolds(tx, orgId);

      if (reactivates(to)) {
        const conflict = await findDateConflict(tx, {
          organizationId: orgId,
          hallId: booking.hallId,
          eventDate: booking.eventDate,
          excludeBookingId: booking.id,
        });
        if (conflict) {
          throw new BookingConflictError({
            reference: conflict.reference,
            clientName: conflict.client.name,
            hallName: conflict.hall.name,
          });
        }
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: to,
          cancelledAt: to === "CANCELLED" ? new Date() : null,
          cancellationReason:
            to === "CANCELLED" ? (cancellationReason ?? null) : null,
          holdExpiresAt:
            to === "HOLD"
              ? addDays(new Date(), DEFAULT_HOLD_DAYS)
              : to === "CONFIRMED" || to === "COMPLETED"
                ? null
                : booking.holdExpiresAt,
        },
      });
    });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return fail(`الموعد صار محجوز — حجز ${err.conflict.reference}.`);
    }
    if (isDbConflictError(err))
      return fail("الموعد محجوز الآن على هذه القاعة.");
    console.error("transitionBooking failed", err);
    return fail("صار خطأ. جرّب مرة ثانية.");
  }

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}
