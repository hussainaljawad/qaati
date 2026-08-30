import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getLabels } from "@/lib/labels";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { setTeamMemberActiveAction } from "@/app/actions/settings";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import { PageHeader } from "@/components/app/PageHeader";
import { TeamMemberForm } from "@/components/settings/TeamMemberForm";

export const metadata: Metadata = { title: "الفريق" };

export default async function TeamPage() {
  const session = await requireAdmin();
  const locale = (await getLocale()) as Locale;

  const t = await getTranslations("team");
  const roleLabels = getLabels(locale).userRole;
  const members = await db.user.findMany({
    where: { organizationId: session.organization.id },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHeader title={t("title")} backHref="/settings" />

      <div className="space-y-4 p-4">
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className={`flex items-center justify-between gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-4 ${
                m.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-kufi text-sm font-bold text-ink">
                  {m.name}
                  {m.id === session.user.id ? ` ${t("you")}` : ""}
                </p>
                <p className="truncate text-[11px] text-ink-soft" dir="ltr">
                  {m.email}
                </p>
                <p className="text-[11px] text-ink-soft">
                  {roleLabels[m.role]}
                  {m.lastLoginAt
                    ? ` · ${t("lastLogin", { date: formatDate(m.lastLoginAt, locale, { day: "numeric", month: "short" }) })}`
                    : ""}
                </p>
              </div>
              {m.id !== session.user.id ? (
                <form action={setTeamMemberActiveAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-ink-soft underline"
                  >
                    {m.isActive ? t("disable") : t("enable")}
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>

        <TeamMemberForm />
      </div>
    </>
  );
}
