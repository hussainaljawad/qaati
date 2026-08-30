import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** ترويسة صفحة داخلية: زر رجوع + عنوان + إجراء اختياري، بنقشة المشربية. */
export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="bg-header relative overflow-hidden px-4 pb-5 pt-5 text-paper">
      <div className="mashrabiya pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="رجوع"
              className="-ms-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-paper/10"
            >
              <ChevronRight className="size-5 ltr:rotate-180" />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate font-kufi text-lg font-bold">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-paper/70">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
