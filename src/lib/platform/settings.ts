import { db } from "@/lib/db";
import { STANDARD_PLAN } from "@/lib/billing/plans";

const SINGLETON = "singleton";

export type PlatformSettings = Awaited<ReturnType<typeof getPlatformSettings>>;

/** إعدادات المنصّة (باقة + أسعار + حساب البنك). صف واحد — يُنشأ عند أول قراءة. */
export async function getPlatformSettings() {
  const row = await db.platformSettings.upsert({
    where: { id: SINGLETON },
    create: { id: SINGLETON },
    update: {},
  });
  return row;
}

/** الباقة الفعّالة: الاسم والأسعار من قاعدة البيانات + المزايا من الإعداد الثابت. */
export async function getEffectivePlan() {
  const s = await getPlatformSettings();
  return {
    id: "standard",
    nameAr: s.planNameAr,
    nameEn: s.planNameEn,
    priceFilsMonthly: s.priceMonthlyFils,
    priceFilsYearly: s.priceYearlyFils,
    currency: s.currency,
    features: STANDARD_PLAN.features,
  };
}

/** هل بيانات التحويل البنكي مكتملة كفاية للعرض على المشترك؟ */
export function hasBankDetails(s: {
  bankName: string | null;
  bankIban: string | null;
  benefitNumber: string | null;
}): boolean {
  return Boolean(s.bankName || s.bankIban || s.benefitNumber);
}
