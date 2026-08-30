import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listHalls } from "@/lib/halls/queries";
import { getMonthBookings } from "@/lib/bookings/queries";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { CalendarView } from "@/components/calendar/CalendarView";

export const metadata: Metadata = { title: "التقويم" };

function parseMonth(value: string | undefined): {
  year: number;
  monthIndex: number;
} {
  const m = value && /^(\d{4})-(\d{2})$/.exec(value);
  if (m) return { year: Number(m[1]), monthIndex: Number(m[2]) - 1 };
  const now = new Date();
  return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
}

export default async function CalendarPage({
  searchParams,
}: PageProps<"/calendar">) {
  const session = await requireActiveSubscription();
  const orgId = session.organization.id;
  const t = await getTranslations("calendar");
  const sp = await searchParams;

  const { year, monthIndex } = parseMonth(
    typeof sp.month === "string" ? sp.month : undefined,
  );
  const hallId = typeof sp.hall === "string" ? sp.hall : undefined;

  const [halls, bookings] = await Promise.all([
    listHalls(orgId, { activeOnly: true }),
    getMonthBookings(orgId, year, monthIndex, hallId),
  ]);

  return (
    <>
      <MashrabiyaHeader
        title={t("title")}
        subtitle={session.organization.name}
      />
      <CalendarView
        year={year}
        monthIndex={monthIndex}
        hallId={hallId}
        halls={halls.map((h) => ({ id: h.id, name: h.name, color: h.color }))}
        bookings={bookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          eventType: b.eventType,
          eventDate: b.eventDate.toISOString(),
          startTime: b.startTime,
          status: b.status as "HOLD" | "CONFIRMED" | "COMPLETED",
          hallName: b.hall.name,
          hallColor: b.hall.color,
          clientName: b.client.name,
        }))}
      />
    </>
  );
}
