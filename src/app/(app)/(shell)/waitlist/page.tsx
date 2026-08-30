import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listWaitlist } from "@/lib/waitlist/queries";
import { setWaitlistStatusAction } from "@/app/actions/waitlist";
import { formatDate } from "@/lib/format";
import { waLink } from "@/lib/notifications/whatsapp";
import type { Locale } from "@/i18n/config";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "قائمة الانتظار" };

const STATUS = {
  WAITING: { label: "بالانتظار", tone: "gold" as const },
  OFFERED: { label: "عُرض عليه", tone: "olive" as const },
};

export default async function WaitlistPage() {
  const session = await requireActiveSubscription();
  const locale = (await getLocale()) as Locale;
  const entries = await listWaitlist(session.organization.id);

  return (
    <>
      <MashrabiyaHeader
        title="قائمة الانتظار"
        subtitle={session.organization.name}
        action={
          <Link
            href="/waitlist/new"
            aria-label="طلب جديد"
            className="flex size-9 items-center justify-center rounded-full bg-gold text-ink"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      <div className="p-4">
        {entries.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
            قائمة الانتظار فاضية
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((e) => {
              const name = e.client?.name ?? e.contactName ?? "—";
              const phone = e.client?.phone ?? e.contactPhone ?? "";
              const meta =
                STATUS[e.status as keyof typeof STATUS] ?? STATUS.WAITING;
              return (
                <div
                  key={e.id}
                  className="rounded-[var(--radius-card)] border border-line bg-paper p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-kufi text-sm font-bold text-ink">
                        {name}
                      </p>
                      <p className="text-[11px] text-ink-soft">
                        {formatDate(e.requestedDate, locale, {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                        })}
                        {e.flexible ? " · مرن" : ""}
                        {e.hall ? ` · ${e.hall.name}` : ""}
                      </p>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  {e.notes ? (
                    <p className="mt-1.5 text-xs text-ink-soft">{e.notes}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                    {phone ? (
                      <a
                        href={waLink(
                          phone,
                          `مرحباً ${name}، بخصوص طلبكم لتاريخ ${formatDate(e.requestedDate, locale, { day: "numeric", month: "long" })} في ${session.organization.name}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-olive"
                      >
                        واتساب
                      </a>
                    ) : null}
                    {e.client ? (
                      <Link
                        href={`/bookings/new?client=${e.client.id}&date=${e.requestedDate.toISOString().slice(0, 10)}${e.hallId ? `&hall=${e.hallId}` : ""}`}
                        className="text-gold"
                      >
                        حوّل لحجز
                      </Link>
                    ) : null}
                    <form action={setWaitlistStatusAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={e.status === "WAITING" ? "OFFERED" : "WAITING"}
                      />
                      <button type="submit" className="text-ink-soft">
                        {e.status === "WAITING"
                          ? "تعليم كمعروض"
                          : "رجوع للانتظار"}
                      </button>
                    </form>
                    <form action={setWaitlistStatusAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button type="submit" className="text-wine">
                        إزالة
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
