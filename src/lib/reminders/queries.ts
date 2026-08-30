import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { startOfDayUtc } from "@/lib/dates";

/** مناسبات مؤكدة خلال الأيام القليلة القادمة — لتذكير "قبل يوم المناسبة". */
export function upcomingEventsForReminder(
  organizationId: string,
  withinDays = 2,
) {
  const today = startOfDayUtc(new Date());
  return db.booking.findMany({
    where: {
      organizationId,
      status: "CONFIRMED",
      eventDate: { gte: today, lte: addDays(today, withinDays) },
    },
    orderBy: { eventDate: "asc" },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      hall: { select: { name: true } },
    },
  });
}

/** آخر تذكير مُرسل لكل حجز حسب النوع — لعرض "أُرسل من قبل". */
export async function lastRemindersByBooking(
  organizationId: string,
  bookingIds: string[],
) {
  if (bookingIds.length === 0) return new Map<string, Date>();
  const rows = await db.reminder.findMany({
    where: {
      organizationId,
      bookingId: { in: bookingIds },
      status: "SENT",
    },
    orderBy: { sentAt: "desc" },
    select: { bookingId: true, kind: true, sentAt: true },
  });
  const map = new Map<string, Date>();
  for (const r of rows) {
    const key = `${r.bookingId}:${r.kind}`;
    if (!map.has(key) && r.sentAt) map.set(key, r.sentAt);
  }
  return map;
}
