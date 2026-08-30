import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { PageHeader } from "@/components/app/PageHeader";
import { HallForm } from "@/components/halls/HallForm";

export const metadata: Metadata = { title: "قاعة جديدة" };

export default async function NewHallPage() {
  await requireAdmin();
  const t = await getTranslations("halls");
  return (
    <>
      <PageHeader title={t("new")} backHref="/settings/halls" />
      <HallForm />
    </>
  );
}
