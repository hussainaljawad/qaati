"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, fromZod, type FormState } from "@/lib/forms";
import { platformLoginSchema } from "@/lib/validation";
import {
  checkPlatformCredentials,
  createPlatformCookie,
  destroyPlatformCookie,
  requirePlatform,
} from "@/lib/platform/auth";
import {
  activateSubscription,
  expireSubscription,
  extendSubscription,
  extendTrial,
} from "@/lib/billing/provider";

export async function platformLoginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = platformLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fromZod(parsed.error);

  if (!checkPlatformCredentials(parsed.data.email, parsed.data.password)) {
    return fail("بيانات الدخول غير صحيحة");
  }

  await createPlatformCookie(parsed.data.email);
  redirect("/platform");
}

export async function platformLogoutAction() {
  await destroyPlatformCookie();
  redirect("/platform/login");
}

export async function activateOrgAction(formData: FormData) {
  await requirePlatform();
  const orgId = String(formData.get("orgId") ?? "");
  const interval = formData.get("interval") === "yearly" ? "yearly" : "monthly";
  if (!orgId) return;
  await activateSubscription(orgId, interval);
  revalidatePath("/platform");
  revalidatePath(`/platform/subscribers/${orgId}`);
}

export async function extendOrgAction(formData: FormData) {
  await requirePlatform();
  const orgId = String(formData.get("orgId") ?? "");
  const kind = String(formData.get("kind") ?? "sub"); // sub | trial
  const days = Math.max(1, Math.min(365, Number(formData.get("days") ?? 30)));
  if (!orgId) return;
  if (kind === "trial") await extendTrial(orgId, days);
  else await extendSubscription(orgId, days);
  revalidatePath("/platform");
  revalidatePath(`/platform/subscribers/${orgId}`);
}

export async function expireOrgAction(formData: FormData) {
  await requirePlatform();
  const orgId = String(formData.get("orgId") ?? "");
  if (!orgId) return;
  await expireSubscription(orgId);
  revalidatePath("/platform");
  revalidatePath(`/platform/subscribers/${orgId}`);
}
