import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { PageHeader } from "@/components/app/PageHeader";
import { HallForm } from "@/components/halls/HallForm";

export const metadata: Metadata = { title: "قاعة جديدة" };

export default async function NewHallPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="قاعة جديدة" backHref="/settings/halls" />
      <HallForm />
    </>
  );
}
