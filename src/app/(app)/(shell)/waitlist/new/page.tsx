import type { Metadata } from "next";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listHalls } from "@/lib/halls/queries";
import { listClients } from "@/lib/clients/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export const metadata: Metadata = { title: "طلب انتظار" };

export default async function NewWaitlistPage() {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;

  const [halls, clients] = await Promise.all([
    listHalls(orgId, { activeOnly: true }),
    listClients(orgId, { take: 500 }),
  ]);

  return (
    <>
      <PageHeader title="طلب على قائمة الانتظار" backHref="/waitlist" />
      <WaitlistForm
        halls={halls.map((h) => ({ id: h.id, name: h.name }))}
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
        }))}
      />
    </>
  );
}
