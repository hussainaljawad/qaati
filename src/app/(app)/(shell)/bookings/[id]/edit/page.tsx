import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getBooking } from "@/lib/bookings/queries";
import { toDateOnlyString } from "@/lib/dates";
import { PageHeader } from "@/components/app/PageHeader";
import { BookingForm } from "@/components/bookings/BookingForm";

export const metadata: Metadata = { title: "تعديل الحجز" };

export default async function EditBookingPage({
  params,
}: PageProps<"/bookings/[id]/edit">) {
  const session = await requireActiveSubscription();
  const { id } = await params;

  const booking = await getBooking(session.organization.id, id);
  if (!booking) notFound();

  return (
    <>
      <PageHeader
        title="تعديل الحجز"
        subtitle={`حجز ${booking.reference}`}
        backHref={`/bookings/${booking.id}`}
      />
      <BookingForm
        mode="edit"
        booking={{
          id: booking.id,
          eventType: booking.eventType,
          eventDate: toDateOnlyString(booking.eventDate),
          startTime: booking.startTime,
          endTime: booking.endTime,
          guestsCount: booking.guestsCount,
          totalAmountFils: booking.totalAmountFils,
          discountFils: booking.discountFils,
          terms: booking.terms,
          notes: booking.notes,
          hallName: booking.hall.name,
          clientName: booking.client.name,
        }}
      />
    </>
  );
}
