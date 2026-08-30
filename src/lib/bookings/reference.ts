import type { Prisma } from "@prisma/client";

/** رقم حجز تسلسلي لكل منشأة: B-2026-0001. يُستدعى داخل معاملة. */
export async function nextBookingReference(
  db: Prisma.TransactionClient,
  organizationId: string,
): Promise<string> {
  const year = new Date().getUTCFullYear();
  const counter = await db.bookingCounter.findUnique({
    where: { organizationId },
  });

  let num: number;
  if (!counter) {
    await db.bookingCounter.create({
      data: { organizationId, year, lastNumber: 1 },
    });
    num = 1;
  } else if (counter.year !== year) {
    await db.bookingCounter.update({
      where: { organizationId },
      data: { year, lastNumber: 1 },
    });
    num = 1;
  } else {
    const updated = await db.bookingCounter.update({
      where: { organizationId },
      data: { lastNumber: { increment: 1 } },
    });
    num = updated.lastNumber;
  }

  return `B-${year}-${String(num).padStart(4, "0")}`;
}
