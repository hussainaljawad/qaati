import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/app/LanguageToggle";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const t = await getTranslations();

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-kufi text-lg font-bold text-ink">
            {t("brand.name")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-paper-2"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line px-4 py-6 text-center text-xs text-ink-soft">
        {t("marketing.footer")}
      </footer>
    </div>
  );
}
