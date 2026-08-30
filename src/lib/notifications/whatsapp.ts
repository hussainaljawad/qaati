/**
 * طبقة الإشعارات — المرحلة الحالية: رابط wa.me يفتح رسالة جاهزة.
 * لاحقاً: WhatsApp Business API عبر نفس الواجهة.
 */

const BAHRAIN_CC = "973";

/** يبني رابط واتساب برسالة مُرمّزة. يفترض البحرين للأرقام المحلية (٨ خانات). */
export function waLink(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 8) digits = BAHRAIN_CC + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** نص تذكير بالمبلغ المتبقي. */
export function paymentReminderText(input: {
  orgName: string;
  clientName: string;
  eventType: string;
  dateText: string;
  remainingText: string;
  dueText?: string;
  reference: string;
}): string {
  return [
    `مرحباً ${input.clientName} 👋`,
    `تذكير بخصوص حجزكم (${input.reference}) — ${input.eventType} بتاريخ ${input.dateText} في ${input.orgName}.`,
    ``,
    `المبلغ المتبقي: ${input.remainingText}`,
    input.dueText ? `آخر موعد للسداد: ${input.dueText}` : "",
    ``,
    `نرجو إكمال السداد في أقرب وقت. شكراً لكم 🌹`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** نص تذكير قبل يوم المناسبة. */
export function eventReminderText(input: {
  orgName: string;
  clientName: string;
  eventType: string;
  dateText: string;
  timeText?: string;
  hallName: string;
}): string {
  return [
    `مرحباً ${input.clientName} 👋`,
    `تذكير: مناسبتكم (${input.eventType}) غداً ${input.dateText}${input.timeText ? ` الساعة ${input.timeText}` : ""} في ${input.hallName} — ${input.orgName}.`,
    ``,
    `القاعة جاهزة لاستقبالكم. بالتوفيق 🌹`,
  ].join("\n");
}

/** نص تأكيد/تفاصيل حجز جاهز للإرسال. */
export function bookingSummaryText(input: {
  orgName: string;
  clientName: string;
  hallName: string;
  eventType: string;
  dateText: string;
  timeText?: string;
  reference: string;
}): string {
  const lines = [
    `مرحباً ${input.clientName} 👋`,
    `تفاصيل حجزكم في ${input.orgName}:`,
    ``,
    `• المناسبة: ${input.eventType}`,
    `• القاعة: ${input.hallName}`,
    `• التاريخ: ${input.dateText}${input.timeText ? ` الساعة ${input.timeText}` : ""}`,
    `• رقم الحجز: ${input.reference}`,
    ``,
    `لأي استفسار تواصلوا معنا. شكراً لكم 🌹`,
  ];
  return lines.join("\n");
}
