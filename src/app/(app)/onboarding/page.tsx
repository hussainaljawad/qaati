import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { OnboardingForm } from "@/components/forms/OnboardingForm";

export const metadata = { title: "البداية" };

export default async function OnboardingPage() {
  const session = await requireUser();

  // أكمل onboarding من قبل؟ للوحة التحكم مباشرة.
  if (session.organization.onboardedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <OnboardingForm />
      </div>
    </div>
  );
}
