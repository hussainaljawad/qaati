import { db } from "@/lib/db";

export function listWaitlist(
  organizationId: string,
  opts: {
    status?: ("WAITING" | "OFFERED" | "CONVERTED" | "EXPIRED" | "CANCELLED")[];
  } = {},
) {
  return db.waitlistEntry.findMany({
    where: {
      organizationId,
      status: { in: opts.status ?? ["WAITING", "OFFERED"] },
    },
    orderBy: { requestedDate: "asc" },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      hall: { select: { name: true } },
    },
  });
}

/** طلبات انتظار مطابقة لموعد تحرّر للتو (تاريخ + قاعة اختيارية). */
export function matchingWaitlist(
  organizationId: string,
  date: Date,
  hallId?: string,
) {
  const today = new Date();
  return db.waitlistEntry.findMany({
    where: {
      organizationId,
      status: "WAITING",
      AND: [
        {
          OR: [
            { requestedDate: date },
            { flexible: true, requestedDate: { gte: today } },
          ],
        },
        ...(hallId ? [{ OR: [{ hallId }, { hallId: null }] }] : []),
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { client: { select: { id: true, name: true, phone: true } } },
    take: 10,
  });
}
