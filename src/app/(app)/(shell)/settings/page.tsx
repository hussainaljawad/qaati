import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  Building2,
  CreditCard,
  DoorOpen,
  LogOut,
  Truck,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listHalls } from "@/lib/halls/queries";
import { effectiveStatus, trialDaysLeft } from "@/lib/billing/subscription";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { OrgProfileForm } from "@/components/settings/OrgProfileForm";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const session = await requireAdmin();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("settings");
  const tc = await getTranslations("common");
  const org = session.organization;

  const halls = await listHalls(org.id);
  const status = effectiveStatus(session.subscription);
  const days = trialDaysLeft(session.subscription);

  const subLabel =
    status === "TRIALING"
      ? t("subTrial", { days: formatNumber(days, locale) })
      : status === "ACTIVE"
        ? t("subActive")
        : t("subEnded");

  return (
    <>
      <MashrabiyaHeader title={t("title")} subtitle={org.name} />

      <div className="space-y-5 p-4">
        <nav className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
          <SettingsRow
            href="/settings/halls"
            icon={<DoorOpen className="size-5" />}
            label={t("halls")}
            hint={t("hallsActive", {
              count: formatNumber(
                halls.filter((h) => h.isActive).length,
                locale,
              ),
            })}
          />
          <SettingsRow
            href="/settings/team"
            icon={<Users className="size-5" />}
            label={t("team")}
          />
          <SettingsRow
            href="/settings/vendors"
            icon={<Truck className="size-5" />}
            label={t("vendors")}
          />
          <SettingsRow
            href="/billing"
            icon={<CreditCard className="size-5" />}
            label={t("subscription")}
            hint={subLabel}
          />
        </nav>

        <section className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <h2 className="mb-3 flex items-center gap-2 font-kufi text-sm font-bold text-ink">
            <Building2 className="size-4" /> {t("orgSection")}
          </h2>
          <OrgProfileForm
            org={{
              name: org.name,
              phone: org.phone,
              address: org.address,
              vatNumber: org.vatNumber,
              crNumber: org.crNumber,
            }}
          />
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <h2 className="mb-3 font-kufi text-sm font-bold text-ink">
            {tc("language")}
          </h2>
          <LanguageSwitcher />
        </section>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-semibold text-wine"
          >
            <LogOut className="size-4" /> {t("logout")}
          </button>
        </form>
      </div>
    </>
  );
}

function SettingsRow({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4">
      <span className="text-ink-soft">{icon}</span>
      <span className="flex-1 font-semibold text-ink">{label}</span>
      {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
      <span className="text-ink-soft">‹</span>
    </Link>
  );
}
