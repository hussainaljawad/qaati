import { requireUser } from "@/lib/auth/guards";

/** تخطيط صفحات الطباعة: بلا هيكل تطبيق، خلفية بيضاء، A4. */
export default async function PrintLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return (
    <div className="min-h-dvh bg-white text-[#1a1a1a] print:bg-white">
      <div className="mx-auto max-w-[210mm] p-6 print:p-0">{children}</div>
    </div>
  );
}
