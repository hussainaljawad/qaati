"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VendorConfirmationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireActiveSubscription, requireAdmin } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { bhdToFils } from "@/lib/money";
import { bookingVendorSchema, vendorSchema } from "@/lib/validation";

export async function addBookingVendorAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const parsed = bookingVendorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const booking = await db.booking.findFirst({
    where: { id: d.bookingId, organizationId: orgId },
    select: { id: true },
  });
  if (!booking) return fail("الحجز غير موجود");

  let vendorId: string | null = null;
  if (d.saveToDirectory) {
    const v = await db.vendor.create({
      data: {
        organizationId: orgId,
        name: d.name,
        category: d.category,
        phone: d.phone ?? null,
        contactPerson: d.contactPerson ?? null,
      },
    });
    vendorId = v.id;
  }

  await db.bookingVendor.create({
    data: {
      organizationId: orgId,
      bookingId: booking.id,
      vendorId,
      category: d.category,
      name: d.name,
      phone: d.phone ?? null,
      contactPerson: d.contactPerson ?? null,
      costFils: d.costBhd ? bhdToFils(d.costBhd) : null,
      notes: d.notes ?? null,
      status: "PENDING",
    },
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function setBookingVendorStatusAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !Object.values(VendorConfirmationStatus).includes(
      status as VendorConfirmationStatus,
    )
  ) {
    return;
  }
  const bv = await db.bookingVendor.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true, bookingId: true },
  });
  if (!bv) return;
  await db.bookingVendor.update({
    where: { id },
    data: { status: status as VendorConfirmationStatus },
  });
  revalidatePath(`/bookings/${bv.bookingId}`);
}

export async function deleteBookingVendorAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const id = String(formData.get("id") ?? "");
  const bv = await db.bookingVendor.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true, bookingId: true },
  });
  if (!bv) return;
  await db.bookingVendor.delete({ where: { id } });
  revalidatePath(`/bookings/${bv.bookingId}`);
}

// ── دليل الموردين (ADMIN) ────────────────────────────────────────────────

export async function createVendorAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = vendorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  await db.vendor.create({
    data: {
      organizationId: session.organization.id,
      name: d.name,
      category: d.category,
      phone: d.phone ?? null,
      contactPerson: d.contactPerson ?? null,
      notes: d.notes ?? null,
    },
  });

  revalidatePath("/settings/vendors");
  redirect("/settings/vendors");
}

export async function deleteVendorAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const v = await db.vendor.findFirst({
    where: { id, organizationId: session.organization.id },
    select: { id: true },
  });
  if (!v) return;
  await db.vendor.delete({ where: { id } });
  revalidatePath("/settings/vendors");
}
