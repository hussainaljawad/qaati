import { db } from "@/lib/db";

export function getContract(organizationId: string, id: string) {
  return db.contract.findFirst({
    where: { id, organizationId },
    include: {
      booking: { select: { id: true, reference: true } },
    },
  });
}

export function getBookingContract(organizationId: string, bookingId: string) {
  return db.contract.findFirst({
    where: { organizationId, bookingId },
    select: { id: true, contractNumber: true, signedAt: true },
  });
}
