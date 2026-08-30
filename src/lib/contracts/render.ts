import { db } from "@/lib/db";
import { formatDate, formatHijriDate, formatTime } from "@/lib/format";
import { computeVat } from "@/lib/invoices/vat";
import { PAYMENT_KIND_LABEL } from "@/lib/payments/plan";

export const DEFAULT_CONTRACT_TERMS = [
  "١. يُعدّ هذا العقد ملزماً للطرفين من تاريخ توقيعه ودفع العربون.",
  "٢. العربون غير مسترد في حال إلغاء الحجز من طرف العميل.",
  "٣. يُسدَّد كامل المبلغ المتبقي قبل موعد المناسبة بسبعة أيام على الأقل.",
  "٤. تلتزم القاعة بتجهيز الصالة بالخدمات المتفق عليها في الموعد المحدد.",
  "٥. أي أضرار تلحق بمرافق القاعة أثناء المناسبة يتحملها العميل.",
  "٦. لا يجوز للعميل التنازل عن الحجز للغير إلا بموافقة خطية من إدارة القاعة.",
].join("\n");

/** رقم العقد مشتق من رقم الحجز: B-2026-0012 ⇒ C-2026-0012. */
export function contractNumberFor(bookingReference: string): string {
  return bookingReference.replace(/^B-/, "C-");
}

export interface ContractDoc {
  contractNumber: string;
  generatedAt: string;
  seller: {
    name: string;
    vatNumber: string | null;
    crNumber: string | null;
    address: string | null;
    phone: string | null;
  };
  client: { name: string; phone: string };
  event: {
    hallName: string;
    eventType: string;
    dateText: string;
    hijriText: string;
    timeText: string | null;
    guestsCount: number | null;
    capacity: number | null;
  };
  pricing: {
    totalFils: number;
    discountFils: number;
    netFils: number;
    vatInclusive: boolean;
    vatRate: number;
    subtotalFils: number;
    vatFils: number;
  };
  paymentPlan: {
    label: string;
    amountFils: number;
    dueDateText: string | null;
  }[];
  terms: string;
}

/** يبني لقطة بيانات العقد من الحجز وقت الإنشاء. */
export async function buildContractDoc(
  organizationId: string,
  bookingId: string,
): Promise<ContractDoc | null> {
  const booking = await db.booking.findFirst({
    where: { id: bookingId, organizationId },
    include: {
      client: true,
      hall: true,
      organization: true,
      payments: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!booking) return null;

  const org = booking.organization;
  const net = booking.totalAmountFils - booking.discountFils;
  const rate = Number(org.vatRate);
  const vat = computeVat(net, rate, booking.vatInclusive);

  return {
    contractNumber: contractNumberFor(booking.reference),
    generatedAt: new Date().toISOString(),
    seller: {
      name: org.name,
      vatNumber: org.vatNumber,
      crNumber: org.crNumber,
      address: org.address,
      phone: org.phone,
    },
    client: { name: booking.client.name, phone: booking.client.phone },
    event: {
      hallName: booking.hall.name,
      eventType: booking.eventType,
      dateText: formatDate(booking.eventDate, "ar", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      hijriText: formatHijriDate(booking.eventDate, "ar"),
      timeText: booking.startTime
        ? formatTime(booking.startTime, "ar") +
          (booking.endTime ? ` – ${formatTime(booking.endTime, "ar")}` : "")
        : null,
      guestsCount: booking.guestsCount,
      capacity: booking.hall.capacitySeated,
    },
    pricing: {
      totalFils: booking.totalAmountFils,
      discountFils: booking.discountFils,
      netFils: net,
      vatInclusive: booking.vatInclusive,
      vatRate: rate,
      subtotalFils: vat.subtotalFils,
      vatFils: vat.vatFils,
    },
    paymentPlan: booking.payments
      .filter((p) => p.kind !== "REFUND")
      .map((p) => ({
        label: PAYMENT_KIND_LABEL[p.kind],
        amountFils: p.amountFils,
        dueDateText: p.dueDate
          ? formatDate(p.dueDate, "ar", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null,
      })),
    terms: booking.terms?.trim() || DEFAULT_CONTRACT_TERMS,
  };
}
