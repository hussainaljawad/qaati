import type { Metadata } from "next";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { PageHeader } from "@/components/app/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "عميل جديد" };

export default async function NewClientPage({
  searchParams,
}: PageProps<"/clients/new">) {
  await requireActiveSubscription();
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <>
      <PageHeader title="عميل جديد" backHref="/clients" />
      <ClientForm next={next} />
    </>
  );
}
