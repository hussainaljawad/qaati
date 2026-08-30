import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getInvoice } from "@/lib/invoices/queries";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { PrintButton } from "@/components/print/PrintButton";

export const metadata: Metadata = { title: "طباعة الفاتورة" };

export default async function PrintInvoicePage({
  params,
}: PageProps<"/print/invoice/[id]">) {
  const session = await requireUser();
  const { id } = await params;

  const invoice = await getInvoice(session.organization.id, id);
  if (!invoice) notFound();

  return (
    <div>
      <div className="mb-4 print:hidden">
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
