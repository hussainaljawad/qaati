import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/forms/SignupForm";
import { TRIAL_DAYS } from "@/lib/billing/plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signupTitle") };
}

export default function SignupPage() {
  return <SignupForm trialDays={TRIAL_DAYS} />;
}
