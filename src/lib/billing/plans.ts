/**
 * الباقات — حالياً باقة واحدة. تُعرَّف هنا كإعداد ثابت (لا جدول DB).
 * السعر بالفلس. عند ربط بوابة دفع لاحقاً، هذه هي مصدر الحقيقة للأسعار.
 */

export interface Plan {
  id: string;
  nameAr: string;
  nameEn: string;
  priceFilsMonthly: number;
  priceFilsYearly: number;
  currency: string;
  features: { ar: string; en: string }[];
}

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14);

export const STANDARD_PLAN: Plan = {
  id: "standard",
  nameAr: "باقة قاعتي",
  nameEn: "Qaati Plan",
  priceFilsMonthly: 12_000, // ١٢٫٠٠٠ د.ب / شهر
  priceFilsYearly: 120_000, // ١٢٠٫٠٠٠ د.ب / سنة (شهران مجاناً)
  currency: "BHD",
  features: [
    { ar: "قاعات غير محدودة تحت منشأتك", en: "Unlimited halls" },
    { ar: "تقويم يمنع تعارض الحجوزات", en: "Conflict-free booking calendar" },
    { ar: "عقود ودفعات على مراحل", en: "Contracts & staged payments" },
    {
      ar: "فواتير متوافقة مع ضريبة القيمة المضافة",
      en: "VAT-compliant invoices",
    },
    { ar: "تذكيرات واتساب للعملاء", en: "WhatsApp client reminders" },
    { ar: "مستخدمون متعددون بصلاحيات", en: "Multiple users with roles" },
  ],
};

export const PLANS: Record<string, Plan> = {
  standard: STANDARD_PLAN,
};

export function getPlan(id: string): Plan {
  return PLANS[id] ?? STANDARD_PLAN;
}
