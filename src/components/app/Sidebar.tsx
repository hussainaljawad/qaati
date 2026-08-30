"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, Plus } from "lucide-react";
import { NAV_SIDEBAR } from "./nav-items";
import { logoutAction } from "@/app/actions/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** الشريط الجانبي — كمبيوتر فقط (lg وأكبر). */
export function Sidebar({
  orgName,
  isAdmin,
}: {
  orgName: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tb = useTranslations("bookings");
  const tc = useTranslations("common");

  const items = NAV_SIDEBAR.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside className="bg-header sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto text-paper lg:flex">
      <div className="mashrabiya pointer-events-none absolute inset-0 opacity-10" />

      <div className="relative z-10 flex flex-1 flex-col p-4">
        <div className="mb-6 px-2 pt-2">
          <p className="font-kufi text-lg font-bold">قاعتي</p>
          <p className="truncate text-xs text-paper/60">{orgName}</p>
        </div>

        <Link
          href="/bookings/new"
          className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gold px-3 py-2.5 text-sm font-bold text-ink"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          {tb("new")}
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-paper/15 text-paper"
                    : "text-paper/70 hover:bg-paper/10 hover:text-paper"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.3 : 1.9} />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3 border-t border-paper/15 pt-4">
          <LanguageSwitcher compact />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-paper/70 hover:text-paper"
            >
              <LogOut className="size-4" />
              {tc("logout")}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
