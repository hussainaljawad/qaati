import type { VendorCategory } from "@prisma/client";
import { db } from "@/lib/db";

export const VENDOR_CATEGORY_LABEL: Record<VendorCategory, string> = {
  CATERING: "كيترينج",
  PHOTOGRAPHY: "تصوير",
  DECOR: "ديكور",
  DJ: "دي جي",
  FLOWERS: "ورد",
  LIGHTING: "إضاءة",
  SECURITY: "أمن",
  OTHER: "أخرى",
};

export const VENDOR_STATUS_LABEL = {
  PENDING: "بانتظار",
  CONFIRMED: "مؤكد",
  DECLINED: "معتذر",
} as const;

export function listVendors(organizationId: string) {
  return db.vendor.findMany({
    where: { organizationId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export function listBookingVendors(organizationId: string, bookingId: string) {
  return db.bookingVendor.findMany({
    where: { organizationId, bookingId },
    orderBy: { createdAt: "asc" },
  });
}
