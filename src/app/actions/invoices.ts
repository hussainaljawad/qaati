"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireActiveSubscription, requireAdmin } from "@/lib/auth/guards";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { bhdToFils } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { computeVat, sumLineItems } from "@/lib/invoices/vat";
import { nextInvoiceNumber } from "@/lib/invoices/sequence";
import { invoiceLineSchema, invoiceStatusSchema } from "@/lib/validation";

/** ينشئ فاتورة من حجز (أو يفتح الموجودة). */
export async function generateInvoiceAction(formData: FormData) {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const bookingId = String(formData.get("bookingId") ?? "");

  const existing = await db.invoice.findFirst({
    where: { organizationId: orgId, bookingId },
    select: { id: true },
  });
  if (existing) redirect(`/invoices/${existing.id}`);

  const booking = await db.booking.findFirst({
    where: { id: bookingId, organizationId: orgId },
    include: {
      client: true,
      hall: { select: { name: true } },
      organization: true,
    },
  });
  if (!booking) return;

  const org = booking.organization;
  const net = booking.totalAmountFils - booking.discountFils;
  const rate = Number(org.vatRate);
  const vat = computeVat(net, rate, booking.vatInclusive);

  const description = `حجز قاعة «${booking.hall.name}» — ${booking.eventType} بتاريخ ${formatDate(
    booking.eventDate,
    "ar",
    { day: "numeric", month: "long", year: "numeric" },
  )} (حجز ${booking.reference})`;

  const invoiceId = await db.$transaction(async (tx) => {
    const invoiceNumber = await nextInvoiceNumber(tx, orgId);
    const inv = await tx.invoice.create({
      data: {
        organizationId: orgId,
        bookingId: booking.id,
        clientId: booking.clientId,
        invoiceNumber,
        currency: org.currency,
        subtotalFils: vat.subtotalFils,
        vatRate: org.vatRate,
        vatFils: vat.vatFils,
        totalFils: vat.totalFils,
        status: "DRAFT",
        sellerSnapshot: {
          name: org.name,
          vatNumber: org.vatNumber,
          crNumber: org.crNumber,
          address: org.address,
          phone: org.phone,
        },
        buyerSnapshot: {
          name: booking.client.name,
          phone: booking.client.phone,
          address: null,
          vatNumber: null,
        },
        lineItems: {
          create: [
            {
              description,
              quantity: 1,
              unitPriceFils: vat.subtotalFils,
              amountFils: vat.subtotalFils,
              vatRate: org.vatRate,
            },
          ],
        },
      },
    });
    return inv.id;
  });

  revalidatePath(`/bookings/${booking.id}`);
  redirect(`/invoices/${invoiceId}`);
}

/** يستبدل بنود فاتورة (مسودة فقط) ويعيد حساب الإجماليات. */
export async function updateInvoiceLinesAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const invoiceId = String(formData.get("invoiceId") ?? "");

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
    select: { id: true, status: true, vatRate: true },
  });
  if (!invoice) return fail("الفاتورة غير موجودة");
  if (invoice.status !== "DRAFT") return fail("لا يمكن تعديل فاتورة صادرة");

  // البنود تأتي كمصفوفات متوازية
  const descriptions = formData.getAll("description").map(String);
  const quantities = formData.getAll("quantity").map(String);
  const prices = formData.getAll("unitPriceBhd").map(String);

  const rows: {
    description: string;
    quantity: number;
    unitPriceFils: number;
    amountFils: number;
  }[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    if (!descriptions[i]?.trim()) continue;
    const parsed = invoiceLineSchema.safeParse({
      description: descriptions[i],
      quantity: quantities[i],
      unitPriceBhd: prices[i],
    });
    if (!parsed.success) return fromZod(parsed.error);
    const unitFils = bhdToFils(parsed.data.unitPriceBhd);
    rows.push({
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unitPriceFils: unitFils,
      amountFils: Math.round(unitFils * parsed.data.quantity),
    });
  }
  if (rows.length === 0) return fail("أضف بنداً واحداً على الأقل");

  const rate = Number(invoice.vatRate);
  const totals = sumLineItems(rows, rate);

  await db.$transaction([
    db.invoiceLineItem.deleteMany({ where: { invoiceId } }),
    db.invoiceLineItem.createMany({
      data: rows.map((r) => ({ ...r, invoiceId, vatRate: invoice.vatRate })),
    }),
    db.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotalFils: totals.subtotalFils,
        vatFils: totals.vatFils,
        totalFils: totals.totalFils,
      },
    }),
  ]);

  revalidatePath(`/invoices/${invoiceId}`);
  return { ok: true };
}

export async function setInvoiceStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = invoiceStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  // إبطال الفاتورة = المالك فقط
  const session =
    parsed.data.status === "VOID"
      ? await requireAdmin()
      : await requireActiveSubscription();

  const invoice = await db.invoice.findFirst({
    where: {
      id: parsed.data.invoiceId,
      organizationId: session.organization.id,
    },
    select: { id: true },
  });
  if (!invoice) return fail("الفاتورة غير موجودة");

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      status: parsed.data.status,
      issueDate: parsed.data.status === "ISSUED" ? new Date() : undefined,
    },
  });

  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/invoices");
  return { ok: true };
}
