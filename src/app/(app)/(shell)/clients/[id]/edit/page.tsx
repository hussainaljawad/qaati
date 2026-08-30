import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getClient } from "@/lib/clients/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export const metadata: Metadata = { title: "تعديل العميل" };

export default async function EditClientPage({
  params,
}: PageProps<"/clients/[id]/edit">) {
  const session = await requireActiveSubscription();
  const { id } = await params;
  const tc = await getTranslations("common");

  const client = await getClient(session.organization.id, id);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={`${tc("edit")} · ${client.name}`}
        backHref={`/clients/${client.id}`}
      />
      <ClientForm
        client={{
          id: client.id,
          name: client.name,
          phone: client.phone,
          altPhone: client.altPhone,
          email: client.email,
          nationalId: client.nationalId,
          notes: client.notes,
          preferences: client.preferences,
        }}
      />
    </>
  );
}
