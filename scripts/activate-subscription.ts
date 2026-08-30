/**
 * تفعيل اشتراك منشأة يدوياً (محاكاة الدفع).
 *   npm run billing:activate -- <organizationId> [monthly|yearly]
 *   npm run billing:activate -- --list        # عرض المنشآت وحالاتها
 */
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const db = new PrismaClient();

async function list() {
  const orgs = await db.organization.findMany({
    include: {
      subscription: true,
      _count: { select: { users: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  for (const o of orgs) {
    const s = o.subscription;
    console.log(
      `${o.id}  ${o.name}\n   حالة: ${s?.status ?? "—"}  تجربة تنتهي: ${
        s?.trialEndsAt?.toISOString().slice(0, 10) ?? "—"
      }  مستخدمون: ${o._count.users}  حجوزات: ${o._count.bookings}\n`,
    );
  }
}

async function activate(orgId: string, interval: "monthly" | "yearly") {
  const now = new Date();
  const sub = await db.subscription.update({
    where: { organizationId: orgId },
    data: {
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: addDays(now, interval === "yearly" ? 365 : 30),
      cancelAtPeriodEnd: false,
    },
  });
  await db.subscriptionEvent.create({
    data: {
      organizationId: orgId,
      type: "ACTIVATED",
      note: `تفعيل يدوي (${interval})`,
    },
  });
  console.log(
    `✅ فُعّل الاشتراك للمنشأة ${orgId} حتى ${sub.currentPeriodEnd?.toISOString().slice(0, 10)}`,
  );
}

async function run() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  if (args.length === 0 || args[0] === "--list") {
    await list();
    return;
  }
  const orgId = args[0];
  const interval = args[1] === "yearly" ? "yearly" : "monthly";
  await activate(orgId, interval);
}

run()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
