import type { Payment, PaymentKind, PaymentStatus } from "@prisma/client";

/** حالة الدفعة الفعلية عند القراءة: DUE متأخرة ⇒ OVERDUE. */
export function effectivePaymentStatus(
  p: Pick<Payment, "status" | "dueDate">,
  now: Date = new Date(),
): PaymentStatus {
  if (p.status === "DUE" && p.dueDate && p.dueDate.getTime() < now.getTime()) {
    return "OVERDUE";
  }
  return p.status;
}

export interface PaymentSummary {
  netFils: number;
  plannedFils: number; // مجموع كل الأقساط (DUE + PAID)
  paidFils: number;
  dueFils: number; // غير مدفوع (DUE + OVERDUE)
  overdueFils: number;
  unplannedFils: number; // netFils - plannedFils (قد يكون سالباً)
  remainingFils: number; // netFils - paidFils
  fullyPaid: boolean;
}

export function summarizePayments(
  netFils: number,
  payments: Pick<Payment, "amountFils" | "status" | "dueDate" | "kind">[],
  now: Date = new Date(),
): PaymentSummary {
  let plannedFils = 0;
  let paidFils = 0;
  let dueFils = 0;
  let overdueFils = 0;

  for (const p of payments) {
    if (p.kind === "REFUND") {
      paidFils -= p.amountFils;
      continue;
    }
    plannedFils += p.amountFils;
    const st = effectivePaymentStatus(p, now);
    if (st === "PAID") paidFils += p.amountFils;
    else if (st === "OVERDUE") {
      dueFils += p.amountFils;
      overdueFils += p.amountFils;
    } else if (st === "DUE") dueFils += p.amountFils;
  }

  return {
    netFils,
    plannedFils,
    paidFils,
    dueFils,
    overdueFils,
    unplannedFils: netFils - plannedFils,
    remainingFils: Math.max(netFils - paidFils, 0),
    fullyPaid: netFils > 0 && paidFils >= netFils,
  };
}

/** قوالب خطط دفع جاهزة — نسب من الصافي. */
export interface PlanPreset {
  id: string;
  label: string;
  parts: { kind: PaymentKind; ratio: number; dueOffsetDays: number }[];
}

export const PLAN_PRESETS: PlanPreset[] = [
  {
    id: "deposit-final",
    label: "عربون ٣٠٪ + تسديد نهائي ٧٠٪",
    parts: [
      { kind: "DEPOSIT", ratio: 0.3, dueOffsetDays: 0 },
      { kind: "FINAL", ratio: 0.7, dueOffsetDays: -7 },
    ],
  },
  {
    id: "three-parts",
    label: "عربون + دفعة وسط + نهائي (٣ / ٤ / ٣)",
    parts: [
      { kind: "DEPOSIT", ratio: 0.3, dueOffsetDays: 0 },
      { kind: "MILESTONE", ratio: 0.4, dueOffsetDays: -30 },
      { kind: "FINAL", ratio: 0.3, dueOffsetDays: -7 },
    ],
  },
  {
    id: "half-half",
    label: "نصف عربون + نصف نهائي",
    parts: [
      { kind: "DEPOSIT", ratio: 0.5, dueOffsetDays: 0 },
      { kind: "FINAL", ratio: 0.5, dueOffsetDays: -7 },
    ],
  },
];

/** يوزّع مبلغاً على نسب مع تصحيح الكسر في آخر جزء. */
export function splitByRatio(totalFils: number, ratios: number[]): number[] {
  const parts = ratios.map((r) => Math.round(totalFils * r));
  const diff = totalFils - parts.reduce((s, p) => s + p, 0);
  if (parts.length) parts[parts.length - 1] += diff;
  return parts;
}

export const PAYMENT_KIND_LABEL: Record<PaymentKind, string> = {
  DEPOSIT: "عربون",
  MILESTONE: "دفعة وسط",
  FINAL: "تسديد نهائي",
  REFUND: "استرجاع",
  OTHER: "أخرى",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: "نقد",
  BANK_TRANSFER: "تحويل بنكي",
  BENEFIT: "بنفت",
  BENEFITPAY: "BenefitPay",
  CHEQUE: "شيك",
  CARD: "بطاقة",
  OTHER: "أخرى",
};
