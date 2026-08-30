import Link from "next/link";
import { requirePlatform } from "@/lib/platform/auth";
import { getPlatformSettings } from "@/lib/platform/settings";
import { PlatformSettingsForm } from "@/components/platform/PlatformSettingsForm";

export default async function PlatformSettingsPage() {
  await requirePlatform();
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-5">
      <Link href="/platform" className="text-xs font-semibold text-ink-soft">
        ‹ رجوع للوحة
      </Link>
      <h1 className="font-kufi text-xl font-bold">إعدادات المنصّة</h1>
      <PlatformSettingsForm
        settings={{
          planNameAr: settings.planNameAr,
          planNameEn: settings.planNameEn,
          priceMonthlyFils: settings.priceMonthlyFils,
          priceYearlyFils: settings.priceYearlyFils,
          bankName: settings.bankName,
          bankAccountName: settings.bankAccountName,
          bankIban: settings.bankIban,
          bankAccountNumber: settings.bankAccountNumber,
          benefitNumber: settings.benefitNumber,
          paymentNote: settings.paymentNote,
        }}
      />
    </div>
  );
}
