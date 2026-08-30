import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/app/LanguageToggle";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const t = await getTranslations();

  return (
    <div className="flex min-h-dvh flex-col bg-paper-2">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-kufi text-lg font-bold text-ink">
          {t("brand.name")}
        </Link>
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
