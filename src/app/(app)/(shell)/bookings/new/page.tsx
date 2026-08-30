import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listHalls } from "@/lib/halls/queries";
import { listClients } from "@/lib/clients/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { BookingForm } from "@/components/bookings/BookingForm";

export const metadata: Metadata = { title: "حجز جديد" };

export default async function NewBookingPage({
  searchParams,
}: PageProps<"/bookings/new">) {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const sp = await searchParams;

  const [halls, clients] = await Promise.all([
    listHalls(orgId, { activeOnly: true }),
    listClients(orgId, { take: 500 }),
  ]);

  return (
    <>
      <PageHeader title="حجز جديد" backHref="/calendar" />

      {halls.length === 0 ? (
        <div className="p-6 text-center text-sm text-ink-soft">
          لازم تضيف قاعة أول.{" "}
          <Link href="/settings/halls/new" className="font-semibold text-gold">
            أضف قاعة
          </Link>
        </div>
      ) : (
        <BookingForm
          mode="create"
          halls={halls.map((h) => ({ id: h.id, name: h.name }))}
          clients={clients.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
          }))}
          defaultDate={typeof sp.date === "string" ? sp.date : undefined}
          defaultHallId={typeof sp.hall === "string" ? sp.hall : undefined}
          defaultClientId={
            typeof sp.client === "string" ? sp.client : undefined
          }
        />
      )}
    </>
  );
}
