import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getInvoice } from "@/lib/invoices/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor";

export const metadata: Metadata = { title: "الفاتورة" };

export default async function InvoicePage({
  params,
}: PageProps<"/invoices/[id]">) {
  const session = await requireActiveSubscription();
  const { id } = await params;

  const invoice = await getInvoice(session.organization.id, id);
  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`فاتورة ${invoice.invoiceNumber}`}
        subtitle={invoice.client?.name ?? undefined}
        backHref={
          invoice.booking ? `/bookings/${invoice.booking.id}` : "/invoices"
        }
        action={
          <a
            href={`/print/invoice/${invoice.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="طباعة"
            className="flex size-8 items-center justify-center rounded-full bg-paper/10"
          >
            <ExternalLink className="size-4" />
          </a>
        }
      />

      <div className="space-y-4 p-4">
        <InvoiceEditor
          invoiceId={invoice.id}
          status={invoice.status}
          lines={invoice.lineItems.map((li) => ({
            description: li.description,
            quantity: Number(li.quantity),
            unitPriceFils: li.unitPriceFils,
          }))}
        />

        <a
          href={`/print/invoice/${invoice.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink"
        >
          <ExternalLink className="size-4" /> فتح نسخة الطباعة
        </a>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white p-4">
          <InvoiceDocument invoice={invoice} />
        </div>

        {invoice.booking ? (
          <Link
            href={`/bookings/${invoice.booking.id}`}
            className="block text-center text-sm font-medium text-gold"
          >
            رجوع للحجز
          </Link>
        ) : null}
      </div>
    </>
  );
}
