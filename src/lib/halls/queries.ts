import { db } from "@/lib/db";

export function listHalls(
  organizationId: string,
  opts: { activeOnly?: boolean } = {},
) {
  return db.hall.findMany({
    where: {
      organizationId,
      ...(opts.activeOnly ? { isActive: true } : {}),
    },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export function getHall(organizationId: string, id: string) {
  return db.hall.findFirst({ where: { id, organizationId } });
}

export async function countActiveHalls(organizationId: string) {
  return db.hall.count({ where: { organizationId, isActive: true } });
}

/** ألوان مقترحة للقاعات (من نظام الألوان). */
export const HALL_COLORS = [
  "#9C3A48",
  "#2A1B2E",
  "#B07C2C",
  "#516B3E",
  "#6B5C6E",
  "#3A2140",
] as const;
