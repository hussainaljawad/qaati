import { z } from "zod";

// حقل رقمي اختياري من نموذج HTML: "" → undefined (وإلا coerce يحوّلها 0).
const optionalNumber = (max = 10_000_000) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }, z.number().min(0).max(max).optional());

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional(),
);

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "صيغة الوقت HH:MM")
  .optional()
  .or(z.literal("").transform(() => undefined));

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "اختر تاريخاً");

// ── المصادقة ──────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسمك"),
  hallName: z.string().trim().min(2, "اكتب اسم القاعة"),
  email: z.email("بريد إلكتروني غير صحيح").trim().toLowerCase(),
  password: z.string().min(8, "كلمة المرور ٨ أحرف على الأقل"),
});

export const loginSchema = z.object({
  // يقبل بريداً إلكترونياً أو اسم مستخدم (للحساب التجريبي admin)
  email: z.string().trim().toLowerCase().min(1, "اكتب البريد أو اسم المستخدم"),
  password: z.string().min(1, "اكتب كلمة المرور"),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().min(1, "اكتب البريد"),
  password: z.string().min(1, "اكتب كلمة المرور"),
});

export const platformSettingsSchema = z.object({
  planNameAr: z.string().trim().min(2, "اكتب اسم الباقة"),
  planNameEn: z.string().trim().min(2, "English plan name"),
  priceMonthlyBhd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0).max(100_000),
  ),
  priceYearlyBhd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0).max(1_000_000),
  ),
  bankName: optionalText,
  bankAccountName: optionalText,
  bankIban: optionalText,
  bankAccountNumber: optionalText,
  benefitNumber: optionalText,
  paymentNote: optionalText,
});

export const onboardingHallSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم القاعة"),
  section: z.enum(["MEN", "WOMEN", "MIXED"]),
  capacitySeated: optionalNumber(100_000),
  basePriceBhd: optionalNumber(1_000_000),
});

// ── القاعات ──────────────────────────────────────────────────────────────

export const hallSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم القاعة"),
  nameEn: optionalText,
  section: z.enum(["MEN", "WOMEN", "MIXED"]),
  capacitySeated: optionalNumber(100_000),
  capacityStanding: optionalNumber(100_000),
  basePriceBhd: optionalNumber(1_000_000),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح")
    .default("#9C3A48"),
  notes: optionalText,
  isActive: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean(),
  ),
});

// ── العملاء ──────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم العميل"),
  phone: z.string().trim().min(6, "اكتب رقم الجوال"),
  altPhone: optionalText,
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.email("بريد غير صحيح").optional(),
  ),
  nationalId: optionalText,
  notes: optionalText,
  preferences: optionalText,
});

// ── الحجوزات ─────────────────────────────────────────────────────────────

export const bookingSchema = z
  .object({
    clientId: optionalText,
    newClientName: optionalText,
    newClientPhone: optionalText,
    hallId: z.string().min(1, "اختر القاعة"),
    eventType: z.string().trim().min(2, "اكتب نوع المناسبة"),
    eventDate: dateString,
    startTime: timeString,
    endTime: timeString,
    status: z.enum(["HOLD", "CONFIRMED"]),
    holdDays: optionalNumber(60),
    guestsCount: optionalNumber(100_000),
    totalBhd: optionalNumber(10_000_000),
    discountBhd: optionalNumber(10_000_000),
    terms: optionalText,
    notes: optionalText,
  })
  .refine((d) => d.clientId || (d.newClientName && d.newClientPhone), {
    message: "اختر عميلاً موجوداً أو اكتب اسم وجوال عميل جديد",
    path: ["clientId"],
  });

export const bookingEditSchema = z.object({
  eventType: z.string().trim().min(2, "اكتب نوع المناسبة"),
  eventDate: dateString,
  startTime: timeString,
  endTime: timeString,
  guestsCount: optionalNumber(100_000),
  totalBhd: optionalNumber(10_000_000),
  discountBhd: optionalNumber(10_000_000),
  terms: optionalText,
  notes: optionalText,
});

export const bookingTransitionSchema = z.object({
  bookingId: z.string().min(1),
  to: z.enum(["HOLD", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  cancellationReason: optionalText,
});

// ── قائمة الانتظار ───────────────────────────────────────────────────────

export const waitlistSchema = z
  .object({
    clientId: optionalText,
    contactName: optionalText,
    contactPhone: optionalText,
    hallId: optionalText,
    requestedDate: dateString,
    flexible: z.preprocess(
      (v) => v === "on" || v === "true" || v === true,
      z.boolean(),
    ),
    notes: optionalText,
  })
  .refine((d) => d.clientId || (d.contactName && d.contactPhone), {
    message: "اختر عميلاً أو اكتب اسم وجوال",
    path: ["contactName"],
  });

// ── الفريق والمنشأة ──────────────────────────────────────────────────────

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "اكتب الاسم"),
  email: z.email("بريد غير صحيح").trim().toLowerCase(),
  password: z.string().min(8, "كلمة المرور ٨ أحرف على الأقل"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const orgProfileSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم المنشأة"),
  phone: optionalText,
  address: optionalText,
  vatNumber: optionalText,
  crNumber: optionalText,
});

// ── الدفعات ──────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "BENEFIT",
  "BENEFITPAY",
  "CHEQUE",
  "CARD",
  "OTHER",
] as const;

export const installmentSchema = z.object({
  bookingId: z.string().min(1),
  kind: z.enum(["DEPOSIT", "MILESTONE", "FINAL", "OTHER"]),
  amountBhd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive("اكتب مبلغاً"),
  ),
  dueDate: dateString.optional().or(z.literal("").transform(() => undefined)),
  note: optionalText,
});

export const recordPaymentSchema = z.object({
  paymentId: z.string().min(1),
  amountBhd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive("اكتب مبلغاً"),
  ),
  method: z.enum(PAYMENT_METHODS),
  paidDate: dateString,
  reference: optionalText,
  note: optionalText,
});

export const planPresetSchema = z.object({
  bookingId: z.string().min(1),
  presetId: z.string().min(1),
});

// ── الفواتير ─────────────────────────────────────────────────────────────

export const invoiceLineSchema = z.object({
  description: z.string().trim().min(1, "اكتب وصفاً"),
  quantity: z.preprocess(
    (v) => (v === "" || v == null ? 1 : Number(v)),
    z.number().positive().max(100_000),
  ),
  unitPriceBhd: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0),
  ),
});

export const invoiceStatusSchema = z.object({
  invoiceId: z.string().min(1),
  status: z.enum(["DRAFT", "ISSUED", "PAID", "VOID"]),
});

// ── العقود ───────────────────────────────────────────────────────────────

export const contractTermsSchema = z.object({
  contractId: z.string().min(1),
  terms: z.string().trim().min(1, "اكتب شروط العقد"),
});

export const contractSignSchema = z.object({
  contractId: z.string().min(1),
  signedByName: z.string().trim().min(2, "اكتب اسم الموقّع"),
});

// ── الموردون ─────────────────────────────────────────────────────────────

const VENDOR_CATEGORIES = [
  "CATERING",
  "PHOTOGRAPHY",
  "DECOR",
  "DJ",
  "FLOWERS",
  "LIGHTING",
  "SECURITY",
  "OTHER",
] as const;

export const bookingVendorSchema = z.object({
  bookingId: z.string().min(1),
  category: z.enum(VENDOR_CATEGORIES),
  name: z.string().trim().min(2, "اكتب اسم المورد"),
  phone: optionalText,
  contactPerson: optionalText,
  costBhd: optionalNumber(10_000_000),
  notes: optionalText,
  saveToDirectory: z.preprocess(
    (v) => v === "on" || v === "true" || v === true,
    z.boolean(),
  ),
});

export const vendorSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم المورد"),
  category: z.enum(VENDOR_CATEGORIES),
  phone: optionalText,
  contactPerson: optionalText,
  notes: optionalText,
});

// ── سجل التواصل ──────────────────────────────────────────────────────────

export const communicationSchema = z.object({
  clientId: z.string().min(1),
  bookingId: optionalText,
  type: z.enum([
    "NOTE",
    "CALL",
    "WHATSAPP",
    "EMAIL",
    "MEETING",
    "SPECIAL_REQUEST",
  ]),
  body: z.string().trim().min(1, "اكتب الملاحظة"),
});

// ── وسوم العميل ──────────────────────────────────────────────────────────

export const clientTagsSchema = z.object({
  clientId: z.string().min(1),
  tags: z.string().trim().default(""),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
