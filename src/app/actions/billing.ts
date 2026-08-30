"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { billingProvider } from "@/lib/billing/provider";

export interface BillingState {
  requested?: boolean;
  error?: string;
}

/** طلب اشتراك — في المزوّد اليدوي يُسجَّل الطلب ويُفعَّل لاحقاً بالسكربت. */
export async function requestSubscriptionAction(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const session = await requireAdmin();
  const interval = formData.get("interval") === "yearly" ? "yearly" : "monthly";

  try {
    const checkout = await billingProvider.createCheckoutSession({
      organizationId: session.organization.id,
      planId: "standard",
      interval,
    });

    await db.subscriptionEvent.create({
      data: {
        organizationId: session.organization.id,
        type: "REQUESTED",
        note: `طلب اشتراك (${interval === "yearly" ? "سنوي" : "شهري"})`,
      },
    });

    if (checkout.url) {
      return { requested: true }; // لاحقاً: redirect(checkout.url)
    }

    revalidatePath("/billing");
    return { requested: true };
  } catch (err) {
    console.error("subscription request failed", err);
    return { error: "billing.errorGeneric" };
  }
}

export async function cancelSubscriptionAction() {
  const session = await requireAdmin();
  await billingProvider.cancelSubscription(session.organization.id);
  revalidatePath("/billing");
}
