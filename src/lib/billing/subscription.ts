import type { Subscription, SubscriptionStatus } from "@prisma/client";

/**
 * الحالة الفعلية للاشتراك تُحسب عند القراءة:
 * تجربة انتهى تاريخها ⇒ EXPIRED حتى لو بقيت TRIALING في قاعدة البيانات.
 */
export function effectiveStatus(
  sub: Pick<Subscription, "status" | "trialEndsAt" | "currentPeriodEnd"> | null,
  now: Date = new Date(),
): SubscriptionStatus | "NONE" {
  if (!sub) return "NONE";

  if (sub.status === "TRIALING") {
    if (sub.trialEndsAt && sub.trialEndsAt.getTime() < now.getTime()) {
      return "EXPIRED";
    }
    return "TRIALING";
  }

  if (sub.status === "ACTIVE") {
    if (
      sub.currentPeriodEnd &&
      sub.currentPeriodEnd.getTime() < now.getTime()
    ) {
      return "PAST_DUE";
    }
    return "ACTIVE";
  }

  return sub.status;
}

/** هل يُسمح باستخدام التطبيق (خارج صفحات الفوترة)؟ */
export function isUsable(status: SubscriptionStatus | "NONE"): boolean {
  return status === "TRIALING" || status === "ACTIVE" || status === "PAST_DUE";
}

/** عدد أيام التجربة المتبقية (٠ إن انتهت أو لم تكن تجربة). */
export function trialDaysLeft(
  sub: Pick<Subscription, "status" | "trialEndsAt"> | null,
  now: Date = new Date(),
): number {
  if (!sub || sub.status !== "TRIALING" || !sub.trialEndsAt) return 0;
  const ms = sub.trialEndsAt.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
