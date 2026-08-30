import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getContract } from "@/lib/contracts/queries";
import type { ContractDoc } from "@/lib/contracts/render";
import { ContractDocument } from "@/components/contracts/ContractDocument";
import { PrintButton } from "@/components/print/PrintButton";

export const metadata: Metadata = { title: "طباعة العقد" };

export default async function PrintContractPage({
  params,
}: PageProps<"/print/contract/[id]">) {
  const session = await requireUser();
  const { id } = await params;

  const contract = await getContract(session.organization.id, id);
  if (!contract) notFound();

  const doc = contract.bodySnapshot as unknown as ContractDoc;

  return (
    <div>
      <div className="mb-4 print:hidden">
        <PrintButton />
      </div>
      <ContractDocument
        doc={doc}
        signedAt={contract.signedAt?.toISOString()}
        signedByName={contract.signedByName}
      />
    </div>
  );
}
