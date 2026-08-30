import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SubscriptionStatus } from "@prisma/client";

/** شريط رفيع أعلى التطبيق: يبيّن أيام التجربة المتبقية أو حالة الاشتراك. */
export async function TrialBanner({
  status,
  trialDaysLeft,
}: {
  status: SubscriptionStatus | "NONE";
  trialDaysLeft: number;
}) {
  const t = await getTranslations("billing");

  if (status === "TRIALING") {
    const urgent = trialDaysLeft <= 3;
    return (
      <Link
        href="/billing"
        className={`block px-4 py-2 text-center text-xs font-medium ${
          urgent ? "bg-wine text-white" : "bg-gold-soft text-ink"
        }`}
      >
        {t("trialDaysLeft", { days: trialDaysLeft })} ←
      </Link>
    );
  }

  if (status === "PAST_DUE") {
    return (
      <Link
        href="/billing"
        className="block bg-wine px-4 py-2 text-center text-xs font-medium text-white"
      >
        {t("trialEndedTitle")} ←
      </Link>
    );
  }

  return null;
}
