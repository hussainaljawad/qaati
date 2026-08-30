import { db } from "@/lib/db";

const bookingInclude = {
  hall: true,
  client: true,
  payments: { orderBy: { createdAt: "asc" } },
  createdBy: { select: { name: true } },
} as const;

export function getBooking(organizationId: string, id: string) {
  return db.booking.findFirst({
    where: { id, organizationId },
    include: bookingInclude,
  });
}

export function listBookings(
  organizationId: string,
  opts: {
    status?: ("HOLD" | "CONFIRMED" | "CANCELLED" | "COMPLETED")[];
    hallId?: string;
    from?: Date;
    to?: Date;
    take?: number;
  } = {},
) {
  return db.booking.findMany({
    where: {
      organizationId,
      ...(opts.status ? { status: { in: opts.status } } : {}),
      ...(opts.hallId ? { hallId: opts.hallId } : {}),
      ...(opts.from || opts.to
        ? {
            eventDate: {
              ...(opts.from ? { gte: opts.from } : {}),
              ...(opts.to ? { lte: opts.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { eventDate: "asc" },
    take: opts.take,
    include: {
      hall: { select: { name: true, color: true } },
      client: { select: { name: true, phone: true } },
    },
  });
}

/** حجوزات شهر معيّن (بلا الملغية) — لعرض التقويم. */
export function getMonthBookings(
  organizationId: string,
  year: number,
  monthIndex: number,
  hallId?: string,
) {
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));
  return db.booking.findMany({
    where: {
      organizationId,
      eventDate: { gte: start, lte: end },
      status: { not: "CANCELLED" },
      ...(hallId ? { hallId } : {}),
    },
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    include: {
      hall: { select: { name: true, color: true } },
      client: { select: { name: true } },
    },
  });
}

export function getDayBookings(
  organizationId: string,
  date: Date,
  hallId?: string,
) {
  return db.booking.findMany({
    where: {
      organizationId,
      eventDate: date,
      status: { not: "CANCELLED" },
      ...(hallId ? { hallId } : {}),
    },
    orderBy: { startTime: "asc" },
    include: {
      hall: { select: { name: true, color: true } },
      client: { select: { name: true, phone: true } },
    },
  });
}

export type BookingWithRelations = NonNullable<
  Awaited<ReturnType<typeof getBooking>>
>;
