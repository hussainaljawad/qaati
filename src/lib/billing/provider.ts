import { db } from "@/lib/db";
import { addDays } from "date-fns";
import { getPlan } from "./plans";

/**
 * طبقة الفوترة قابلة للتوسعة. اليوم: تفعيل يدوي (محاكاة).
 * لاحقاً: StripeBillingProvider / TapBillingProvider عبر
 * src/app/api/billing/[provider]/webhook.
 */
export interface CheckoutSession {
  /** رابط يُوجَّه إليه المستخدم لإتمام الدفع (فارغ في المزوّد اليدوي). */
  url: string | null;
  /** هل فُعّل الاشتراك فوراً (المزوّد اليدوي = false، ينتظر تفعيل المشرف). */
  activated: boolean;
}

export interface BillingProvider {
  readonly id: string;
  createCheckoutSession(input: {
    organizationId: string;
    planId: string;
    interval: "monthly" | "yearly";
  }): Promise<CheckoutSession>;
  cancelSubscription(organizationId: string): Promise<void>;
}

class ManualBillingProvider implements BillingProvider {
  readonly id = "manual";

  async createCheckoutSession() {
    // لا بوابة دفع بعد — يُسجَّل الطلب ويُفعّل يدوياً عبر السكربت.
    return { url: null, activated: false };
  }

  async cancelSubscription(organizationId: string) {
    await db.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: true },
    });
    await db.subscriptionEvent.create({
      data: {
        organizationId,
        type: "CANCELLED",
        note: "طلب إلغاء من المستخدم",
      },
    });
  }
}

export const billingProvider: BillingProvider = new ManualBillingProvider();

/**
 * تفعيل اشتراك يدوياً (يستخدمه سكربت `npm run billing:activate`).
 * يمدّد فترة الاشتراك شهراً أو سنة من اليوم.
 */
export async function activateSubscription(
  organizationId: string,
  interval: "monthly" | "yearly" = "monthly",
) {
  const now = new Date();
  const periodEnd = addDays(now, interval === "yearly" ? 365 : 30);

  const sub = await db.subscription.update({
    where: { organizationId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  await db.subscriptionEvent.create({
    data: {
      organizationId,
      type: "ACTIVATED",
      note: `تفعيل يدوي (${interval}) — ${getPlan(sub.plan).nameAr}`,
    },
  });

  return sub;
}

/** يمدّد اشتراكاً نشطاً بعدد أيام (من نهاية الفترة الحالية أو من اليوم). */
export async function extendSubscription(organizationId: string, days: number) {
  const current = await db.subscription.findUnique({
    where: { organizationId },
  });
  if (!current) return null;
  const base =
    current.currentPeriodEnd && current.currentPeriodEnd > new Date()
      ? current.currentPeriodEnd
      : new Date();
  const sub = await db.subscription.update({
    where: { organizationId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: current.currentPeriodStart ?? new Date(),
      currentPeriodEnd: addDays(base, days),
      cancelAtPeriodEnd: false,
    },
  });
  await db.subscriptionEvent.create({
    data: { organizationId, type: "RENEWED", note: `تمديد يدوي ${days} يوم` },
  });
  return sub;
}

/** يمدّد فترة التجربة بعدد أيام. */
export async function extendTrial(organizationId: string, days: number) {
  const current = await db.subscription.findUnique({
    where: { organizationId },
  });
  if (!current) return null;
  const base =
    current.trialEndsAt && current.trialEndsAt > new Date()
      ? current.trialEndsAt
      : new Date();
  const sub = await db.subscription.update({
    where: { organizationId },
    data: { status: "TRIALING", trialEndsAt: addDays(base, days) },
  });
  await db.subscriptionEvent.create({
    data: {
      organizationId,
      type: "REACTIVATED",
      note: `تمديد التجربة ${days} يوم`,
    },
  });
  return sub;
}

/** ينهي اشتراكاً (يوقف الوصول). */
export async function expireSubscription(
  organizationId: string,
  note?: string,
) {
  const sub = await db.subscription.update({
    where: { organizationId },
    data: { status: "EXPIRED", cancelAtPeriodEnd: false },
  });
  await db.subscriptionEvent.create({
    data: {
      organizationId,
      type: "EXPIRED",
      note: note ?? "إنهاء يدوي من لوحة المشغّل",
    },
  });
  return sub;
}
