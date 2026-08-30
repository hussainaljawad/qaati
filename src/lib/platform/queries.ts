import { db } from "@/lib/db";
import { effectiveStatus, trialDaysLeft } from "@/lib/billing/subscription";
import { getPlatformSettings } from "@/lib/platform/settings";

export type SubStatus = ReturnType<typeof effectiveStatus>;

export async function listSubscribers(search?: string) {
  const q = search?.trim();
  const orgs = await db.organization.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            {
              users: { some: { email: { contains: q, mode: "insensitive" } } },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      _count: {
        select: { users: true, halls: true, bookings: true, clients: true },
      },
      users: {
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { name: true, email: true },
      },
    },
  });

  const now = new Date();
  return orgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    createdAt: o.createdAt,
    owner: o.users[0] ?? null,
    counts: o._count,
    onboarded: Boolean(o.onboardedAt),
    status: effectiveStatus(o.subscription, now),
    storedStatus: o.subscription?.status ?? null,
    trialDaysLeft: trialDaysLeft(o.subscription, now),
    trialEndsAt: o.subscription?.trialEndsAt ?? null,
    currentPeriodEnd: o.subscription?.currentPeriodEnd ?? null,
    plan: o.subscription?.plan ?? null,
  }));
}

/** هل الاشتراك سنوي؟ استدلال من طول الفترة (لا نخزّن الدورة). */
function isYearly(start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return end.getTime() - start.getTime() > 60 * 24 * 60 * 60 * 1000;
}

export async function platformDashboard() {
  const now = new Date();
  const ps = await getPlatformSettings();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  const [subs, allOrgs, events, recentEvents] = await Promise.all([
    db.subscription.findMany({
      select: {
        organizationId: true,
        status: true,
        plan: true,
        trialEndsAt: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        organization: { select: { name: true } },
      },
    }),
    db.organization.findMany({ select: { id: true, createdAt: true } }),
    db.subscriptionEvent.findMany({
      select: { type: true, organizationId: true, createdAt: true },
    }),
    db.subscriptionEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { organization: { select: { name: true, id: true } } },
    }),
  ]);

  // حالات
  const counts = {
    total: subs.length,
    active: 0,
    trialing: 0,
    pastDue: 0,
    expired: 0,
    cancelled: 0,
  };
  let mrrFils = 0;
  const trialsEndingSoon: {
    organizationId: string;
    name: string;
    trialEndsAt: Date;
    days: number;
  }[] = [];

  for (const s of subs) {
    const st = effectiveStatus(s, now);
    if (st === "ACTIVE") {
      counts.active++;
      mrrFils += isYearly(s.currentPeriodStart, s.currentPeriodEnd)
        ? Math.round(ps.priceYearlyFils / 12)
        : ps.priceMonthlyFils;
    } else if (st === "TRIALING") {
      counts.trialing++;
      const days = trialDaysLeft(s, now);
      if (s.trialEndsAt && days <= 7) {
        trialsEndingSoon.push({
          organizationId: s.organizationId,
          name: s.organization.name,
          trialEndsAt: s.trialEndsAt,
          days,
        });
      }
    } else if (st === "PAST_DUE") counts.pastDue++;
    else if (st === "EXPIRED") counts.expired++;
    else if (st === "CANCELLED") counts.cancelled++;
  }
  trialsEndingSoon.sort((a, b) => a.days - b.days);

  // نمو التسجيلات — آخر ٦ أشهر
  const growth: { label: string; count: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    const count = allOrgs.filter(
      (o) => o.createdAt >= d && o.createdAt < next,
    ).length;
    growth.push({
      key: `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`,
      label: new Intl.DateTimeFormat("ar", { month: "short" }).format(d),
      count,
    });
  }

  // هذا الشهر
  const newThisMonth = allOrgs.filter(
    (o) => o.createdAt >= monthStart && o.createdAt < monthEnd,
  ).length;
  const churnedThisMonth = events.filter(
    (e) =>
      (e.type === "CANCELLED" || e.type === "EXPIRED") &&
      e.createdAt >= monthStart &&
      e.createdAt < monthEnd,
  ).length;
  const activatedThisMonth = events.filter(
    (e) =>
      e.type === "ACTIVATED" &&
      e.createdAt >= monthStart &&
      e.createdAt < monthEnd,
  ).length;

  // معدّل التحويل (منشآت فعّلت / منشآت بدأت تجربة)
  const startedTrial = new Set(
    events
      .filter((e) => e.type === "TRIAL_STARTED")
      .map((e) => e.organizationId),
  ).size;
  const everActivated = new Set(
    events.filter((e) => e.type === "ACTIVATED").map((e) => e.organizationId),
  ).size;
  const conversionRate =
    startedTrial > 0 ? Math.round((everActivated / startedTrial) * 100) : 0;

  return {
    counts,
    mrrFils,
    arrFils: mrrFils * 12,
    newThisMonth,
    churnedThisMonth,
    activatedThisMonth,
    conversionRate,
    growth,
    trialsEndingSoon,
    recentEvents,
  };
}

export async function getSubscriberDetail(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      subscription: true,
      users: { orderBy: [{ role: "asc" }, { createdAt: "asc" }] },
      subscriptionEvents: { orderBy: { createdAt: "desc" }, take: 30 },
      _count: {
        select: { halls: true, bookings: true, clients: true, invoices: true },
      },
    },
  });
  if (!org) return null;

  const now = new Date();
  return {
    org,
    status: effectiveStatus(org.subscription, now),
    trialDaysLeft: trialDaysLeft(org.subscription, now),
  };
}
