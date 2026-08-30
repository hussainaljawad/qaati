import { PrismaClient } from "@prisma/client";
import { addDays, startOfMonth } from "date-fns";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_SLUG = "qaat-alnakheel-demo";
const DEMO_PASSWORD = "qaati1234";

async function main() {
  // بداية نظيفة — احذف المنشأة التجريبية وكل ما يتبعها (cascade).
  await db.organization.deleteMany({ where: { slug: DEMO_SLUG } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();
  const monthStart = startOfMonth(now);

  const org = await db.organization.create({
    data: {
      name: "قاعة النخيل",
      slug: DEMO_SLUG,
      vatNumber: "220000123400002",
      crNumber: "134872-1",
      address: "الرفاع، مملكة البحرين",
      phone: "+97317000000",
      onboardedAt: now,
      subscription: {
        create: {
          status: "TRIALING",
          plan: "standard",
          trialEndsAt: addDays(now, 9),
        },
      },
      subscriptionEvents: {
        create: [{ type: "TRIAL_STARTED", note: "حساب تجريبي" }],
      },
      bookingCounter: { create: { year: now.getFullYear(), lastNumber: 0 } },
      invoiceCounter: { create: { year: now.getFullYear(), lastNumber: 0 } },
    },
  });

  const admin = await db.user.create({
    data: {
      organizationId: org.id,
      name: "حمد المالكي",
      email: "admin@qaati.test",
      passwordHash,
      role: "ADMIN",
      phone: "+97333000000",
    },
  });

  await db.user.create({
    data: {
      organizationId: org.id,
      name: "نورة الاستقبال",
      email: "staff@qaati.test",
      passwordHash,
      role: "STAFF",
    },
  });

  const menHall = await db.hall.create({
    data: {
      organizationId: org.id,
      name: "قسم الرجال",
      section: "MEN",
      capacitySeated: 400,
      basePriceFils: 1_200_000,
      color: "#2A1B2E",
      sortOrder: 0,
    },
  });

  const womenHall = await db.hall.create({
    data: {
      organizationId: org.id,
      name: "قسم النساء",
      section: "WOMEN",
      capacitySeated: 350,
      basePriceFils: 1_000_000,
      color: "#9C3A48",
      sortOrder: 1,
    },
  });

  const smallHall = await db.hall.create({
    data: {
      organizationId: org.id,
      name: "الصالة الصغرى",
      section: "MIXED",
      capacitySeated: 150,
      basePriceFils: 550_000,
      color: "#B07C2C",
      sortOrder: 2,
    },
  });

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

  const bookingsData = [
    {
      hall: menHall,
      client: clients[0],
      eventType: "حفل زفاف",
      date: addDays(now, 3),
      status: "CONFIRMED" as const,
      guests: 280,
      total: 1_100_000,
      start: "19:00",
    },
    {
      hall: womenHall,
      client: clients[0],
      eventType: "حفل زفاف",
      date: addDays(now, 3),
      status: "CONFIRMED" as const,
      guests: 300,
      total: 1_000_000,
      start: "19:00",
    },
    {
      hall: smallHall,
      client: clients[1],
      eventType: "خطوبة",
      date: addDays(now, 6),
      status: "HOLD" as const,
      guests: 150,
      total: 650_000,
      start: "18:30",
      holdDays: 5,
    },
    {
      hall: womenHall,
      client: clients[2],
      eventType: "مناسبة عائلية",
      date: addDays(now, 9),
      status: "CONFIRMED" as const,
      guests: 120,
      total: 480_000,
      start: "20:00",
    },
    {
      hall: menHall,
      client: clients[3],
      eventType: "تخرج",
      date: addDays(now, 14),
      status: "HOLD" as const,
      guests: 200,
      total: 900_000,
      start: "20:00",
      holdDays: 7,
    },
    {
      hall: smallHall,
      client: clients[4],
      eventType: "اجتماع سنوي",
      date: addDays(now, 20),
      status: "CONFIRMED" as const,
      guests: 90,
      total: 700_000,
      start: "17:00",
    },
    {
      hall: menHall,
      client: clients[2],
      eventType: "حفل زفاف",
      date: addDays(monthStart, 2),
      status: "COMPLETED" as const,
      guests: 350,
      total: 1_250_000,
      start: "19:30",
    },
  ];

  for (const b of bookingsData) {
    const booking = await db.booking.create({
      data: {
        organizationId: org.id,
        hallId: b.hall.id,
        clientId: b.client.id,
        createdById: admin.id,
        reference: ref(),
        eventType: b.eventType,
        eventDate: b.date,
        startTime: b.start,
        status: b.status,
        guestsCount: b.guests,
        totalAmountFils: b.total,
        holdExpiresAt: b.holdDays ? addDays(now, b.holdDays) : null,
      },
    });

    // دفعات نموذجية: عربون مدفوع + تسديد نهائي مستحق
    const deposit = Math.round(b.total * 0.3);
    await db.payment.create({
      data: {
        organizationId: org.id,
        bookingId: booking.id,
        kind: "DEPOSIT",
        amountFils: deposit,
        status: "PAID",
        method: "BENEFIT",
        paidAt: addDays(now, -10),
        recordedById: admin.id,
      },
    });

    if (b.status !== "COMPLETED") {
      await db.payment.create({
        data: {
          organizationId: org.id,
          bookingId: booking.id,
          kind: "FINAL",
          amountFils: b.total - deposit,
          status: "DUE",
          dueDate: addDays(b.date, -7),
        },
      });
    } else {
      await db.payment.create({
        data: {
          organizationId: org.id,
          bookingId: booking.id,
          kind: "FINAL",
          amountFils: b.total - deposit,
          status: "PAID",
          method: "CASH",
          paidAt: addDays(monthStart, 1),
          recordedById: admin.id,
        },
      });
    }
  }

  await db.bookingCounter.update({
    where: { organizationId: org.id },
    data: { lastNumber: seq },
  });

  await db.waitlistEntry.create({
    data: {
      organizationId: org.id,
      clientId: clients[3].id,
      hallId: menHall.id,
      requestedDate: addDays(now, 3),
      flexible: true,
      notes: "يبي نفس يوم الزفاف المحجوز — على قائمة الانتظار",
    },
  });

  console.log(`✅ تم إنشاء بيانات العرض للمنشأة: ${org.name} (${org.id})`);
  console.log(`   دخول المالك:  admin@qaati.test / ${DEMO_PASSWORD}`);
  console.log(`   دخول الموظف:  staff@qaati.test / ${DEMO_PASSWORD}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
