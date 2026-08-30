import type { CommunicationType } from "@prisma/client";
import { db } from "@/lib/db";

export const COMMUNICATION_TYPE_LABEL: Record<CommunicationType, string> = {
  NOTE: "ملاحظة",
  CALL: "مكالمة",
  WHATSAPP: "واتساب",
  EMAIL: "بريد",
  MEETING: "اجتماع",
  SPECIAL_REQUEST: "طلب خاص",
};

export function listClientCommunications(
  organizationId: string,
  clientId: string,
) {
  return db.communicationLog.findMany({
    where: { organizationId, clientId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      booking: { select: { id: true, reference: true } },
    },
    take: 100,
  });
}
