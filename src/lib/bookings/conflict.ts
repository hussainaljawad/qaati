import { Prisma } from "@prisma/client";

type DbClient = Prisma.TransactionClient;

/**
 * ألغِ الحجوزات المبدئية المنتهية (holdExpiresAt في الماضي) قبل أي فحص تعارض.
 * هذا يحرّر مواعيدها ويمنعها من حجب حجوزات جديدة.
 */
export async function expireStaleHolds(
  db: DbClient,
  organizationId: string,
): Promise<number> {
  const now = new Date();
  const { count } = await db.booking.updateMany({
    where: {
      organizationId,
      status: "HOLD",
      holdExpiresAt: { not: null, lt: now },
    },
    data: {
      status: "CANCELLED",
      cancelledAt: now,
      cancellationReason: "انتهت مدة الحجز المبدئي تلقائياً",
    },
  });
  return count;
}

/**
 * قاعدة الـ MVP: مناسبة واحدة نشطة (مبدئي/مؤكد) لكل قاعة في نفس اليوم.
 * يرجّع الحجز المتعارض إن وُجد، وإلا null. نادِ expireStaleHolds قبله.
 */
export async function findDateConflict(
  db: DbClient,
  args: {
    organizationId: string;
    hallId: string;
    eventDate: Date;
    excludeBookingId?: string;
  },
) {
  return db.booking.findFirst({
    where: {
      organizationId: args.organizationId,
      hallId: args.hallId,
      eventDate: args.eventDate,
      status: { in: ["HOLD", "CONFIRMED"] },
      ...(args.excludeBookingId ? { id: { not: args.excludeBookingId } } : {}),
    },
    include: {
      client: { select: { name: true } },
      hall: { select: { name: true } },
    },
  });
}

export interface BookingConflictInfo {
  reference: string;
  clientName: string;
  hallName: string;
}

/** خطأ يُرمى عند محاولة حجز موعد محجوز. */
export class BookingConflictError extends Error {
  readonly conflict: BookingConflictInfo;

  constructor(conflict: BookingConflictInfo) {
    super(`الموعد محجوز مسبقاً للقاعة (${conflict.reference})`);
    this.name = "BookingConflictError";
    this.conflict = conflict;
  }
}

/** هل الخطأ ناتج عن فهرس منع التعارض في قاعدة البيانات؟ */
export function isDbConflictError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    typeof err.meta?.target === "string" &&
    err.meta.target.includes("bookings_active_hall_date")
  );
}
