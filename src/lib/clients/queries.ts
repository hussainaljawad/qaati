import { db } from "@/lib/db";

export async function listClients(
  organizationId: string,
  opts: { search?: string; take?: number } = {},
) {
  const search = opts.search?.trim();
  return db.client.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { altPhone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: opts.take ?? 200,
    include: { _count: { select: { bookings: true } } },
  });
}

export function getClient(organizationId: string, id: string) {
  return db.client.findFirst({
    where: { id, organizationId },
    include: {
      bookings: {
        orderBy: { eventDate: "desc" },
        include: { hall: { select: { name: true } } },
      },
      _count: { select: { bookings: true } },
    },
  });
}

/** بحث سريع للقائمة المنسدلة في نموذج الحجز. */
export function searchClientsBrief(organizationId: string, search: string) {
  const q = search.trim();
  return db.client.findMany({
    where: {
      organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 8,
    select: { id: true, name: true, phone: true },
  });
}
