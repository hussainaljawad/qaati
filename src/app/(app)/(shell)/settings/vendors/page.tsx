import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { listVendors, VENDOR_CATEGORY_LABEL } from "@/lib/vendors/queries";
import { deleteVendorAction } from "@/app/actions/vendors";
import { waLink } from "@/lib/notifications/whatsapp";
import { PageHeader } from "@/components/app/PageHeader";
import { VendorDirectoryForm } from "@/components/vendors/VendorDirectoryForm";

export const metadata: Metadata = { title: "الموردون" };

export default async function VendorsPage() {
  const session = await requireAdmin();
  const vendors = await listVendors(session.organization.id);

  return (
    <>
      <PageHeader title="دليل الموردين" backHref="/settings" />

      <div className="space-y-4 p-4">
        {vendors.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
            الدليل فاضي. أضف موردينك المعتادين ليسهل ربطهم بالحجوزات.
          </p>
        ) : (
          <ul className="space-y-2">
            {vendors.map((v) => (
              <li
                key={v.id}
                className="flex items-start justify-between gap-2 rounded-[var(--radius-card)] border border-line bg-paper p-3.5"
              >
                <div className="min-w-0">
                  <p className="font-kufi text-sm font-bold text-ink">
                    {v.name}
                  </p>
                  <p className="text-[11px] text-ink-soft">
                    {VENDOR_CATEGORY_LABEL[v.category]}
                    {v.contactPerson ? ` · ${v.contactPerson}` : ""}
                    {v.phone ? ` · ${v.phone}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                  {v.phone ? (
                    <a
                      href={waLink(v.phone, "مرحباً 👋")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-olive"
                    >
                      واتساب
                    </a>
                  ) : null}
                  <form action={deleteVendorAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <button type="submit" className="text-wine">
                      حذف
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <VendorDirectoryForm />
      </div>
    </>
  );
}
