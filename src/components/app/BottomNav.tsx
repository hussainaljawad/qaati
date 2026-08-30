"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_PRIMARY } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-paper/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-[var(--container-app)] items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {NAV_PRIMARY.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium ${
                  active ? "text-ink" : "text-ink-soft"
                }`}
              >
                <span
                  className={`flex size-1.5 rounded-full ${active ? "bg-gold" : "bg-transparent"}`}
                />
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
