import { getTranslations } from "next-intl/server";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";

/** شاشة مؤقتة لأقسام تُبنى في مراحل لاحقة. */
export async function ComingSoon({
  titleKey,
  phase,
}: {
  titleKey: string;
  phase: string;
}) {
  const t = await getTranslations();

  return (
    <>
      <MashrabiyaHeader title={t(titleKey)} />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-16 text-center">
        <p className="font-kufi text-lg font-bold text-ink">
          {t("common.comingSoon")}
        </p>
        <p className="text-sm text-ink-soft">{phase}</p>
      </div>
    </>
  );
}
