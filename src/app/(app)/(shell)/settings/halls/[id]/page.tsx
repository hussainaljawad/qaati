import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getHall } from "@/lib/halls/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { HallForm } from "@/components/halls/HallForm";

export const metadata: Metadata = { title: "تعديل القاعة" };

export default async function EditHallPage({
  params,
}: PageProps<"/settings/halls/[id]">) {
  const session = await requireAdmin();
  const { id } = await params;
  const hall = await getHall(session.organization.id, id);
  if (!hall) notFound();

  return (
    <>
      <PageHeader title="تعديل القاعة" backHref="/settings/halls" />
      <HallForm
        hall={{
          id: hall.id,
          name: hall.name,
          nameEn: hall.nameEn,
          section: hall.section,
          capacitySeated: hall.capacitySeated,
          capacityStanding: hall.capacityStanding,
          basePriceFils: hall.basePriceFils,
          color: hall.color,
          notes: hall.notes,
          isActive: hall.isActive,
        }}
      />
    </>
  );
}
