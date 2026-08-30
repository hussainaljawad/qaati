"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function MashrabiyaHeader({
  title,
  subtitle,
  avatar,
  avatarHref,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  avatar?: string;
  avatarHref?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const ts = useTranslations("nav");
  const avatarEl = avatar ? (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft font-kufi text-sm font-bold text-ink">
      {avatar}
    </div>
  ) : null;

  return (
    <header className="bg-header relative overflow-hidden px-5 pb-6 pt-6 text-paper">
      <div className="mashrabiya pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-kufi text-lg font-bold">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-paper/70">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {avatarHref && avatarEl ? (
            <Link href={avatarHref} aria-label={ts("settings")}>
              {avatarEl}
            </Link>
          ) : (
            avatarEl
          )}
        </div>
      </div>
      {children ? <div className="relative z-10 mt-4">{children}</div> : null}
    </header>
  );
}
