import { redirect } from "next/navigation";
import { effectiveStatus, isUsable } from "@/lib/billing/subscription";
import { getSession } from "./session";

/** يتطلب مستخدماً مسجّلاً — وإلا يعيد التوجيه لصفحة الدخول. */
export async function requireUser(next?: string) {
  const session = await getSession();
  if (!session) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return session;
}

/** يتطلب صلاحية المالك (ADMIN). */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

/** يتطلب اشتراكاً صالحاً للاستخدام — وإلا يوجّه إلى صفحة الفوترة. */
export async function requireActiveSubscription() {
  const session = await requireUser();
  const status = effectiveStatus(session.subscription);
  if (!isUsable(status)) {
    redirect("/billing");
  }
  return { ...session, subscriptionStatus: status };
}
