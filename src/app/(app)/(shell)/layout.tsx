import { redirect } from "next/navigation";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { BottomNav } from "@/components/app/BottomNav";
import { TrialBanner } from "@/components/app/TrialBanner";
import { Fab } from "@/components/app/Fab";
import { Sidebar } from "@/components/app/Sidebar";

/** واجهة التطبيق: شريط جانبي (كمبيوتر) أو تنقّل سفلي (جوال) + المحتوى.
 *  تتطلب اشتراكاً صالحاً وإكمال onboarding. */
export default async function ShellLayout({ children }: LayoutProps<"/">) {
  const session = await requireActiveSubscription();

  if (!session.organization.onboardedAt) {
    redirect("/onboarding");
  }

  const days = trialDaysLeft(session.subscription);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="lg:flex">
      <Sidebar orgName={session.organization.name} isAdmin={isAdmin} />

      <div className="flex min-h-dvh flex-1 flex-col">
        <TrialBanner status={session.subscriptionStatus} trialDaysLeft={days} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col pb-2 lg:pb-10">
          {children}
        </main>
        <Fab href="/bookings/new" label="+" />
        <BottomNav />
      </div>
    </div>
  );
}
