import { db } from "@/lib/db";

export function listBookingPayments(organizationId: string, bookingId: string) {
  return db.payment.findMany({
    where: { organizationId, bookingId },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    include: { recordedBy: { select: { name: true } } },
  });
}

/** كل الدفعات المستحقة (غير المدفوعة) عبر المنشأة — لشاشة التذكيرات ولوحة التحكم. */
export function listOutstandingPayments(organizationId: string) {
  return db.payment.findMany({
    where: {
      organizationId,
      status: "DUE",
      booking: { status: { in: ["CONFIRMED", "HOLD"] } },
    },
    orderBy: { dueDate: "asc" },
    include: {
      booking: {
        select: {
          id: true,
          reference: true,
          eventType: true,
          eventDate: true,
          client: { select: { id: true, name: true, phone: true } },
          hall: { select: { name: true } },
        },
      },
    },
  });
}

export function getPayment(organizationId: string, id: string) {
  return db.payment.findFirst({
    where: { id, organizationId },
    include: {
      booking: {
        select: {
          id: true,
          reference: true,
          eventType: true,
          eventDate: true,
          totalAmountFils: true,
          discountFils: true,
          client: { select: { name: true, phone: true } },
          hall: { select: { name: true } },
        },
      },
    },
  });
}
