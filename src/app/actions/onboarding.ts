"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { bhdToFils } from "@/lib/money";
import { onboardingHallSchema } from "@/lib/validation";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await requireUser();
  const raw = Object.fromEntries(formData);
  const parsed = onboardingHallSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "تحقّق من البيانات" };
  }
  const { name, section, capacitySeated, basePriceBhd } = parsed.data;

  await db.$transaction([
    db.hall.create({
      data: {
        organizationId: session.organization.id,
        name,
        section,
        capacitySeated: capacitySeated ?? null,
        basePriceFils: basePriceBhd ? bhdToFils(basePriceBhd) : 0,
        sortOrder: 0,
      },
    }),
    db.organization.update({
      where: { id: session.organization.id },
      data: { onboardedAt: new Date() },
    }),
  ]);

  redirect("/dashboard");
}

export async function skipOnboardingAction() {
  const session = await requireUser();
  await db.organization.update({
    where: { id: session.organization.id },
    data: { onboardedAt: new Date() },
  });
  redirect("/dashboard");
}
