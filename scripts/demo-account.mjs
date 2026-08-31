/**
 * ينشئ/يعيد ضبط حساب تجريبي دائم للدخول السريع.
 *   دخول:  admin / admin   على  /login
 * اشتراك مُفعّل لا ينتهي + قاعات + عملاء + حجوزات ودفعات نموذجية.
 *
 *   npm run demo                 # على القاعدة في .env (محلي)
 *   POSTGRES_URL_NON_POOLING="<Neon-direct>" node scripts/demo-account.mjs   # على الإنتاج
 */
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const SLUG = "demo-account";

async function main() {
  await db.organization.deleteMany({ where: { slug: SLUG } });

  const now = new Date();
  const passwordHash = await bcrypt.hash("admin", 10);

  const org = await db.organization.create({
    data: {
      name: "القاعة التجريبية",
      slug: SLUG,
      phone: "+97317000000",
      address: "المنامة، مملكة البحرين",
      vatNumber: "220000999900002",
      crNumber: "999999-1",
      onboardedAt: now,
      subscription: {
        create: {
          status: "ACTIVE",
          plan: "standard",
          currentPeriodStart: now,
          currentPeriodEnd: addDays(now, 3650),
        },
      },
      subscriptionEvents: {
        create: [{ type: "ACTIVATED", note: "حساب تجريبي دائم" }],
      },
      bookingCounter: { create: { year: now.getFullYear(), lastNumber: 0 } },
      invoiceCounter: { create: { year: now.getFullYear(), lastNumber: 0 } },
    },
  });

  const admin = await db.user.create({
    data: {
      organizationId: org.id,
      name: "مدير القاعة",
      email: "admin",
      passwordHash,
      role: "ADMIN",
      phone: "+97333000000",
    },
  });

  await db.user.create({
    data: {
      organizationId: org.id,
      name: "موظف الاستقبال",
      email: "staff",
      passwordHash,
      role: "STAFF",
    },
  });

  const [menHall, womenHall, smallHall] = await Promise.all([
    db.hall.create({
      data: {
        organizationId: org.id,
        name: "قسم الرجال",
        section: "MEN",
        capacitySeated: 350,
        basePriceFils: 1_000_000,
        color: "#2A1B2E",
        sortOrder: 1,
      },
    }),
    db.hall.create({
      data: {
        organizationId: org.id,
        name: "قسم النساء",
        section: "WOMEN",
        capacitySeated: 400,
        basePriceFils: 1_200_000,
        color: "#9C3A48",
        sortOrder: 2,
      },
    }),
    db.hall.create({
      data: {
        organizationId: org.id,
        name: "الصالة الصغرى",
        section: "MIXED",
        capacitySeated: 150,
        basePriceFils: 500_000,
        color: "#B07C2C",
        sortOrder: 3,
      },
    }),
  ]);

  const clients = await Promise.all(
    [
      { name: "عائلة المري", phone: "+97336111111" },
      { name: "نورة وسلمان", phone: "+97336222222" },
      { name: "آل خليفة", phone: "+97336333333" },
      { name: "عبدالله الدوسري", phone: "+97336444444" },
      { name: "شركة الخليج للفعاليات", phone: "+97317555555" },
    ].map((c) => db.client.create({ data: { organizationId: org.id, ...c } })),
  );

  let seq = 0;
  const ref = () => `B-${now.getFullYear()}-${String(++seq).padStart(4, "0")}`;

  const rows = [
    { hall: menHall, client: clients[0], eventType: "حفل زفاف", date: addDays(now, 4), status: "CONFIRMED", guests: 280, total: 1_100_000, start: "19:00" },
    { hall: womenHall, client: clients[0], eventType: "حفل زفاف", date: addDays(now, 4), status: "CONFIRMED", guests: 300, total: 1_000_000, start: "18:30" },
    { hall: smallHall, client: clients[1], eventType: "خطوبة", date: addDays(now, 9), status: "HOLD", guests: 120, total: 480_000, start: "20:00", hold: addDays(now, 3) },
    { hall: menHall, client: clients[3], eventType: "تخرج", date: addDays(now, 14), status: "CONFIRMED", guests: 200, total: 750_000, start: "20:00" },
    { hall: womenHall, client: clients[2], eventType: "مناسبة عائلية", date: addDays(now, 18), status: "HOLD", guests: 160, total: 620_000, start: "17:00", hold: addDays(now, 5) },
    { hall: smallHall, client: clients[4], eventType: "اجتماع سنوي", date: addDays(now, -10), status: "COMPLETED", guests: 90, total: 400_000, start: "17:00" },
  ];

  for (const r of rows) {
    const net = r.total;
    const booking = await db.booking.create({
      data: {
        organizationId: org.id,
        hallId: r.hall.id,
        clientId: r.client.id,
        createdById: admin.id,
        reference: ref(),
        eventType: r.eventType,
        eventDate: r.date,
        startTime: r.start,
        status: r.status,
        guestsCount: r.guests,
        totalAmountFils: r.total,
        holdExpiresAt: r.hold ?? null,
      },
    });

    if (r.status === "CONFIRMED" || r.status === "COMPLETED") {
      const deposit = Math.round(net * 0.3);
      await db.payment.create({
        data: {
          organizationId: org.id,
          bookingId: booking.id,
          kind: "DEPOSIT",
          amountFils: deposit,
          status: "PAID",
          method: "BENEFIT",
          paidAt: addDays(now, -20),
          recordedById: admin.id,
        },
      });
      await db.payment.create({
        data: {
          organizationId: org.id,
          bookingId: booking.id,
          kind: "FINAL",
          amountFils: net - deposit,
          status: r.status === "COMPLETED" ? "PAID" : "DUE",
          method: r.status === "COMPLETED" ? "CASH" : null,
          paidAt: r.status === "COMPLETED" ? addDays(now, -8) : null,
          dueDate: addDays(r.date, -7),
        },
      });
    }
  }

  await db.$disconnect();
  console.log(`✅ الحساب التجريبي جاهز — المنشأة: ${org.name}`);
  console.log("   دخول:  admin / admin   (على /login)");
  console.log("   وأيضاً:  staff / admin");
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
