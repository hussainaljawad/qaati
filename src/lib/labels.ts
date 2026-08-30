import type { Locale } from "@/i18n/config";

/**
 * خرائط تسميات القيم المعدودة (enums) بلغتين — مصدر واحد للحقيقة.
 * تُستخدم في مكوّنات الخادم والعميل معاً: getLabels(locale).bookingStatus[status]
 */

type Dict<K extends string> = Record<Locale, Record<K, string>>;

const bookingStatus: Dict<"HOLD" | "CONFIRMED" | "CANCELLED" | "COMPLETED"> = {
  ar: {
    HOLD: "مبدئي",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغي",
    COMPLETED: "مكتمل",
  },
  en: {
    HOLD: "Hold",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  },
};

const hallSection: Dict<"MEN" | "WOMEN" | "MIXED"> = {
  ar: { MEN: "رجال", WOMEN: "نساء", MIXED: "مشترك" },
  en: { MEN: "Men", WOMEN: "Women", MIXED: "Mixed" },
};

const userRole: Dict<"ADMIN" | "STAFF"> = {
  ar: { ADMIN: "مالك / مدير", STAFF: "موظف استقبال" },
  en: { ADMIN: "Owner / Manager", STAFF: "Receptionist" },
};

const paymentKind: Dict<
  "DEPOSIT" | "MILESTONE" | "FINAL" | "REFUND" | "OTHER"
> = {
  ar: {
    DEPOSIT: "عربون",
    MILESTONE: "دفعة وسط",
    FINAL: "تسديد نهائي",
    REFUND: "استرجاع",
    OTHER: "أخرى",
  },
  en: {
    DEPOSIT: "Deposit",
    MILESTONE: "Mid payment",
    FINAL: "Final settlement",
    REFUND: "Refund",
    OTHER: "Other",
  },
};

const paymentMethod: Dict<
  | "CASH"
  | "BANK_TRANSFER"
  | "BENEFIT"
  | "BENEFITPAY"
  | "CHEQUE"
  | "CARD"
  | "OTHER"
> = {
  ar: {
    CASH: "نقد",
    BANK_TRANSFER: "تحويل بنكي",
    BENEFIT: "بنفت",
    BENEFITPAY: "BenefitPay",
    CHEQUE: "شيك",
    CARD: "بطاقة",
    OTHER: "أخرى",
  },
  en: {
    CASH: "Cash",
    BANK_TRANSFER: "Bank transfer",
    BENEFIT: "Benefit",
    BENEFITPAY: "BenefitPay",
    CHEQUE: "Cheque",
    CARD: "Card",
    OTHER: "Other",
  },
};

const paymentStatus: Dict<"DUE" | "PAID" | "OVERDUE" | "WAIVED"> = {
  ar: { DUE: "مستحقة", PAID: "مدفوعة", OVERDUE: "متأخرة", WAIVED: "معفاة" },
  en: { DUE: "Due", PAID: "Paid", OVERDUE: "Overdue", WAIVED: "Waived" },
};

const invoiceStatus: Dict<"DRAFT" | "ISSUED" | "PAID" | "VOID"> = {
  ar: { DRAFT: "مسودة", ISSUED: "صادرة", PAID: "مدفوعة", VOID: "ملغاة" },
  en: { DRAFT: "Draft", ISSUED: "Issued", PAID: "Paid", VOID: "Void" },
};

const waitlistStatus: Dict<
  "WAITING" | "OFFERED" | "CONVERTED" | "EXPIRED" | "CANCELLED"
> = {
  ar: {
    WAITING: "بالانتظار",
    OFFERED: "عُرض عليه",
    CONVERTED: "تحوّل لحجز",
    EXPIRED: "منتهٍ",
    CANCELLED: "ملغى",
  },
  en: {
    WAITING: "Waiting",
    OFFERED: "Offered",
    CONVERTED: "Converted",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  },
};

const vendorCategory: Dict<
  | "CATERING"
  | "PHOTOGRAPHY"
  | "DECOR"
  | "DJ"
  | "FLOWERS"
  | "LIGHTING"
  | "SECURITY"
  | "OTHER"
> = {
  ar: {
    CATERING: "كيترينج",
    PHOTOGRAPHY: "تصوير",
    DECOR: "ديكور",
    DJ: "دي جي",
    FLOWERS: "ورد",
    LIGHTING: "إضاءة",
    SECURITY: "أمن",
    OTHER: "أخرى",
  },
  en: {
    CATERING: "Catering",
    PHOTOGRAPHY: "Photography",
    DECOR: "Decor",
    DJ: "DJ",
    FLOWERS: "Flowers",
    LIGHTING: "Lighting",
    SECURITY: "Security",
    OTHER: "Other",
  },
};

const vendorStatus: Dict<"PENDING" | "CONFIRMED" | "DECLINED"> = {
  ar: { PENDING: "بانتظار", CONFIRMED: "مؤكد", DECLINED: "معتذر" },
  en: { PENDING: "Pending", CONFIRMED: "Confirmed", DECLINED: "Declined" },
};

const communicationType: Dict<
  "NOTE" | "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SPECIAL_REQUEST"
> = {
  ar: {
    NOTE: "ملاحظة",
    CALL: "مكالمة",
    WHATSAPP: "واتساب",
    EMAIL: "بريد",
    MEETING: "اجتماع",
    SPECIAL_REQUEST: "طلب خاص",
  },
  en: {
    NOTE: "Note",
    CALL: "Call",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    MEETING: "Meeting",
    SPECIAL_REQUEST: "Special request",
  },
};

const all = {
  bookingStatus,
  hallSection,
  userRole,
  paymentKind,
  paymentMethod,
  paymentStatus,
  invoiceStatus,
  waitlistStatus,
  vendorCategory,
  vendorStatus,
  communicationType,
};

export function getLabels(locale: Locale) {
  return Object.fromEntries(
    Object.entries(all).map(([k, v]) => [k, v[locale] ?? v.ar]),
  ) as { [K in keyof typeof all]: (typeof all)[K]["ar"] };
}

export type Labels = ReturnType<typeof getLabels>;
