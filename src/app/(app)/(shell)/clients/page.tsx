import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, Search, UserPlus } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { listClients } from "@/lib/clients/queries";
import { MashrabiyaHeader } from "@/components/app/MashrabiyaHeader";

export const metadata: Metadata = { title: "العملاء" };

export default async function ClientsPage({
  searchParams,
}: PageProps<"/clients">) {
  const session = await requireActiveSubscription();
  const t = await getTranslations("clients");
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : "";

  const clients = await listClients(session.organization.id, { search });
  const countText = search
    ? t("results", { count: clients.length })
    : t("count", { count: clients.length });

  return (
    <>
      <MashrabiyaHeader
        title={t("title")}
        subtitle={countText}
        action={
          <Link
            href="/clients/new"
            aria-label={t("new")}
            className="flex size-9 items-center justify-center rounded-full bg-gold text-ink"
          >
            <UserPlus className="size-5" />
          </Link>
        }
      />

      <div className="p-4">
        <form className="relative mb-3">
          <Search className="pointer-events-none absolute inset-y-0 my-auto size-4 text-ink-soft ms-3" />
          <input
            name="q"
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-xl border border-line bg-paper ps-9 pe-3 text-sm outline-none focus:border-gold"
          />
        </form>

        {clients.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
            {search ? t("noResults") : t("empty")}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/clients/${c.id}`}
                  className="flex h-full items-center justify-between gap-2 rounded-xl border border-line bg-paper p-3.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-kufi text-sm font-bold text-ink">
                      {c.name}
                    </span>
                    <span className="block text-[11px] text-ink-soft" dir="ltr">
                      {c.phone}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-soft">
                    {t("bookingsCount", { count: c._count.bookings })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/clients/new"
        className="fixed bottom-20 end-4 z-30 flex size-14 items-center justify-center rounded-full bg-gold text-ink shadow-lg shadow-gold/40 lg:hidden"
        aria-label={t("new")}
      >
        <Plus className="size-7" strokeWidth={2.5} />
      </Link>
    </>
  );
}
