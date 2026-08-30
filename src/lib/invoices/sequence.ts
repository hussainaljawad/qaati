import type { Prisma } from "@prisma/client";

/** رقم فاتورة تسلسلي لكل منشأة: INV-2026-0001. يُستدعى داخل معاملة. */
export async function nextInvoiceNumber(
  db: Prisma.TransactionClient,
  organizationId: string,
): Promise<string> {
  const year = new Date().getUTCFullYear();
  const counter = await db.invoiceCounter.findUnique({
    where: { organizationId },
  });

  let num: number;
  if (!counter) {
    await db.invoiceCounter.create({
      data: { organizationId, year, lastNumber: 1 },
    });
    num = 1;
  } else if (counter.year !== year) {
    await db.invoiceCounter.update({
      where: { organizationId },
      data: { year, lastNumber: 1 },
    });
    num = 1;
  } else {
    const updated = await db.invoiceCounter.update({
      where: { organizationId },
      data: { lastNumber: { increment: 1 } },
    });
    num = updated.lastNumber;
  }

  return `INV-${year}-${String(num).padStart(4, "0")}`;
}
