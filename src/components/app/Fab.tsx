"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

/** زر عائم لإضافة حجز — شاشات التصفّح على الجوال فقط (الكمبيوتر فيه زر بالشريط الجانبي). */
const SHOW_ON = ["/dashboard", "/calendar"];

export function Fab({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  if (!SHOW_ON.includes(pathname)) return null;

  return (
    <Link
      href={href}
      aria-label={label}
      className="fixed bottom-20 end-4 z-30 flex size-14 items-center justify-center rounded-full bg-gold text-ink shadow-lg shadow-gold/40 lg:hidden"
    >
      <Plus className="size-7" strokeWidth={2.5} />
    </Link>
  );
}
