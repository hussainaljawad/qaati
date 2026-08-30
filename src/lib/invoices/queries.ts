import { db } from "@/lib/db";

const invoiceInclude = {
  lineItems: { orderBy: { id: "asc" } },
  client: { select: { name: true, phone: true } },
  booking: {
    select: { id: true, reference: true, eventType: true, eventDate: true },
  },
} as const;

export function getInvoice(organizationId: string, id: string) {
  return db.invoice.findFirst({
    where: { id, organizationId },
    include: invoiceInclude,
  });
}

export function listInvoices(
  organizationId: string,
  opts: { status?: ("DRAFT" | "ISSUED" | "PAID" | "VOID")[] } = {},
) {
  return db.invoice.findMany({
    where: {
      organizationId,
      ...(opts.status ? { status: { in: opts.status } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      booking: { select: { reference: true } },
    },
    take: 100,
  });
}

export function getBookingInvoice(organizationId: string, bookingId: string) {
  return db.invoice.findFirst({
    where: { organizationId, bookingId },
    select: { id: true, invoiceNumber: true, status: true },
  });
}

export type InvoiceWithRelations = NonNullable<
  Awaited<ReturnType<typeof getInvoice>>
>;
