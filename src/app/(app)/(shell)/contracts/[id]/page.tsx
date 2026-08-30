import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getContract } from "@/lib/contracts/queries";
import type { ContractDoc } from "@/lib/contracts/render";
import { PageHeader } from "@/components/app/PageHeader";
import { ContractDocument } from "@/components/contracts/ContractDocument";
import { ContractActions } from "@/components/contracts/ContractActions";

export const metadata: Metadata = { title: "العقد" };

export default async function ContractPage({
  params,
}: PageProps<"/contracts/[id]">) {
  const session = await requireActiveSubscription();
  const { id } = await params;

  const contract = await getContract(session.organization.id, id);
  if (!contract) notFound();

  const doc = contract.bodySnapshot as unknown as ContractDoc;

  return (
    <>
      <PageHeader
        title={`العقد ${contract.contractNumber}`}
        subtitle={doc.client.name}
        backHref={`/bookings/${contract.booking.id}`}
        action={
          <a
            href={`/print/contract/${contract.id}`}
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
        <ContractActions
          contractId={contract.id}
          terms={doc.terms}
          signed={Boolean(contract.signedAt)}
        />

        <a
          href={`/print/contract/${contract.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink"
        >
          <ExternalLink className="size-4" /> فتح نسخة الطباعة
        </a>

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
          <div className="scale-[0.92] origin-top bg-white p-4">
            <ContractDocument
              doc={doc}
              signedAt={contract.signedAt?.toISOString()}
              signedByName={contract.signedByName}
            />
          </div>
        </div>

        <Link
          href={`/bookings/${contract.booking.id}`}
          className="block text-center text-sm font-medium text-gold"
        >
          رجوع للحجز
        </Link>
      </div>
    </>
  );
}
