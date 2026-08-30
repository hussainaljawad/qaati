import { requireUser } from "@/lib/auth/guards";

/** إطار التطبيق. يفرض تسجيل الدخول لكل ما تحته. التخطيط المتجاوب في (shell). */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUser();

  return <div className="min-h-dvh bg-paper-2">{children}</div>;
}
