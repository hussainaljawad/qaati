import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { db } from "@/lib/db";

export async function getDashboardData(orgId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = startOfDay(now);

  const [
    monthBookingsCount,
    activeCount,
    upcoming,
    overdue,
    monthPaid,
    expectedThisMonth,
  ] = await Promise.all([
    db.booking.count({
      where: {
        organizationId: orgId,
        eventDate: { gte: monthStart, lte: monthEnd },
        status: { in: ["HOLD", "CONFIRMED", "COMPLETED"] },
      },
    }),
    db.booking.count({
      where: {
        organizationId: orgId,
        status: "CONFIRMED",
        eventDate: { gte: today },
      },
    }),
    db.booking.findMany({
      where: {
        organizationId: orgId,
        eventDate: { gte: today },
        status: { in: ["HOLD", "CONFIRMED"] },
      },
      orderBy: { eventDate: "asc" },
      take: 6,
      include: { hall: true, client: true, payments: true },
    }),
    // دفعات متأخرة (مستحقة وتجاوز موعدها)
    db.payment.findMany({
      where: {
        organizationId: orgId,
        status: "DUE",
        dueDate: { lt: today },
        booking: { status: { in: ["HOLD", "CONFIRMED"] } },
      },
      select: { amountFils: true },
    }),
    // محصّل هذا الشهر
    db.payment.aggregate({
      _sum: { amountFils: true },
      where: {
        organizationId: orgId,
        status: "PAID",
        kind: { not: "REFUND" },
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    // متوقّع هذا الشهر: صافي حجوزات مؤكدة مناسبتها هذا الشهر
    db.booking.findMany({
      where: {
        organizationId: orgId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        eventDate: { gte: monthStart, lte: monthEnd },
      },
      select: { totalAmountFils: true, discountFils: true },
    }),
  ]);

  const overdueFils = overdue.reduce((s, p) => s + p.amountFils, 0);
  const collectedFils = monthPaid._sum.amountFils ?? 0;
  const expectedFils = expectedThisMonth.reduce(
    (s, b) => s + (b.totalAmountFils - b.discountFils),
    0,
  );

  return {
    monthBookingsCount,
    activeCount,
    overdueCount: overdue.length,
    overdueFils,
    collectedFils,
    expectedFils,
    upcoming,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
export type UpcomingBooking = DashboardData["upcoming"][number];

/** حالة دفع مبسّطة لبطاقة الحجز. */
export function paymentSummary(booking: UpcomingBooking) {
  const total = booking.totalAmountFils - booking.discountFils;
  const paid = booking.payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amountFils, 0);

  if (total > 0 && paid >= total) return "paidFull" as const;
  if (paid > 0) return "due" as const;
  return "depositOnly" as const;
}
