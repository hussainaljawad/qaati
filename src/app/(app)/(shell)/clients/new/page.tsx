import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { PageHeader } from "@/components/app/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "عميل جديد" };

export default async function NewClientPage({
  searchParams,
}: PageProps<"/clients/new">) {
  await requireActiveSubscription();
  const t = await getTranslations("clients");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <>
      <PageHeader title={t("new")} backHref="/clients" />
      <ClientForm next={next} />
    </>
  );
}
