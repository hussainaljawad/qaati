import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { FileText, Pencil, Receipt } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth/guards";
import { getBooking } from "@/lib/bookings/queries";
import { listBookingPayments } from "@/lib/payments/queries";
import { summarizePayments } from "@/lib/payments/plan";
import { getBookingContract } from "@/lib/contracts/queries";
import { getBookingInvoice } from "@/lib/invoices/queries";
import { matchingWaitlist } from "@/lib/waitlist/queries";
import { STATUS_TONE } from "@/lib/bookings/status";
import {
  formatDate,
  formatHijriDate,
  formatNumber,
  formatTime,
} from "@/lib/format";
import { formatMoney } from "@/lib/money";
import {
  bookingSummaryText,
  paymentReminderText,
  waLink,
} from "@/lib/notifications/whatsapp";
import type { Locale } from "@/i18n/config";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { BookingStatusActions } from "@/components/bookings/BookingStatusActions";
import { PaymentPlan } from "@/components/payments/PaymentPlan";
import { WhatsappSendButton } from "@/components/app/WhatsappSendButton";
import { BookingVendors } from "@/components/vendors/BookingVendors";
import { listBookingVendors, listVendors } from "@/lib/vendors/queries";
import { generateContractAction } from "@/app/actions/contracts";
import { generateInvoiceAction } from "@/app/actions/invoices";

export const metadata: Metadata = { title: "تفاصيل الحجز" };

const STATUS_LABEL = {
  HOLD: "مبدئي",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغي",
  COMPLETED: "مكتمل",
} as const;

export default async function BookingPage({
  params,
}: PageProps<"/bookings/[id]">) {
  const session = await requireActiveSubscription();
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const org = session.organization;

  const booking = await getBooking(org.id, id);
  if (!booking) notFound();

  const [payments, contract, invoice, bookingVendors, vendorDirectory] =
    await Promise.all([
      listBookingPayments(org.id, booking.id),
      getBookingContract(org.id, booking.id),
      getBookingInvoice(org.id, booking.id),
      listBookingVendors(org.id, booking.id),
      listVendors(org.id),
    ]);

  const net = booking.totalAmountFils - booking.discountFils;
  const summary = summarizePayments(
    net,
    payments.map((p) => ({
      amountFils: p.amountFils,
      status: p.status,
      dueDate: p.dueDate,
      kind: p.kind,
    })),
  );

  const dateText = formatDate(booking.eventDate, locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const confirmText = bookingSummaryText({
    orgName: org.name,
    clientName: booking.client.name,
    hallName: booking.hall.name,
    eventType: booking.eventType,
    dateText,
    timeText: booking.startTime
      ? formatTime(booking.startTime, locale)
      : undefined,
    reference: booking.reference,
  });

  const reminderText = paymentReminderText({
    orgName: org.name,
    clientName: booking.client.name,
    eventType: booking.eventType,
    dateText,
    remainingText: formatMoney(summary.remainingFils, locale),
    reference: booking.reference,
  });

  const waitlistMatches =
    booking.status === "CANCELLED"
      ? await matchingWaitlist(org.id, booking.eventDate, booking.hallId)
      : [];

  const editable =
    booking.status !== "COMPLETED" && booking.status !== "CANCELLED";

  return (
    <>
      <PageHeader
        title={`${booking.eventType} — ${booking.client.name}`}
        subtitle={`حجز ${booking.reference}`}
        backHref="/calendar"
        action={
          editable ? (
            <Link
              href={`/bookings/${booking.id}/edit`}
              aria-label="تعديل"
              className="flex size-8 items-center justify-center rounded-full bg-paper/10"
            >
              <Pencil className="size-4" />
            </Link>
          ) : null
        }
      />

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={STATUS_TONE[booking.status]}>
            {STATUS_LABEL[booking.status]}
          </Badge>
          <WhatsappSendButton
            phone={booking.client.phone}
            body={confirmText}
            clientId={booking.clientId}
            bookingId={booking.id}
            reminderKind="BOOKING_CONFIRMATION"
            label="إرسال التفاصيل"
          />
        </div>

        {/* التفاصيل */}
        <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-card)] border border-line bg-paper p-4 text-sm">
          <Row
            label="العميل"
            value={booking.client.name}
            sub={booking.client.phone}
          />
          <Row label="القاعة" value={booking.hall.name} />
          <Row
            label="التاريخ"
            value={dateText}
            sub={formatHijriDate(booking.eventDate, locale) + " هـ"}
          />
          <Row
            label="الوقت"
            value={
              booking.startTime
                ? formatTime(booking.startTime, locale) +
                  (booking.endTime
                    ? ` – ${formatTime(booking.endTime, locale)}`
                    : "")
                : "—"
            }
          />
          <Row
            label="الضيوف"
            value={
              booking.guestsCount
                ? formatNumber(booking.guestsCount, locale)
                : "—"
            }
          />
          <Row label="أنشأه" value={booking.createdBy?.name ?? "—"} />
        </dl>

        {/* خطة الدفع */}
        <PaymentPlan
          bookingId={booking.id}
          netFils={net}
          locale={locale}
          payments={payments.map((p) => ({
            id: p.id,
            kind: p.kind,
            amountFils: p.amountFils,
            dueDate: p.dueDate ? p.dueDate.toISOString() : null,
            paidAt: p.paidAt ? p.paidAt.toISOString() : null,
            method: p.method,
            status: p.status,
            reference: p.reference,
            recordedByName: p.recordedBy?.name ?? null,
          }))}
        />

        {/* تذكير بالمتبقي */}
        {summary.remainingFils > 0 && booking.status !== "CANCELLED" ? (
          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-wine-soft bg-wine-soft/20 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                متبقٍ {formatMoney(summary.remainingFils, locale)}
              </p>
              <p className="text-[11px] text-ink-soft">أرسل تذكيراً للعميل</p>
            </div>
            <WhatsappSendButton
              phone={booking.client.phone}
              body={reminderText}
              clientId={booking.clientId}
              bookingId={booking.id}
              reminderKind="PAYMENT_DUE"
              label="تذكير واتساب"
            />
          </div>
        ) : null}

        {/* العقد والفاتورة */}
        <div className="grid grid-cols-2 gap-3">
          {contract ? (
            <Link
              href={`/contracts/${contract.id}`}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-line bg-paper p-4 text-center"
            >
              <FileText className="size-5 text-gold" />
              <span className="text-xs font-semibold text-ink">
                العقد {contract.contractNumber}
              </span>
              <span className="text-[10px] text-ink-soft">
                {contract.signedAt ? "موقّع" : "غير موقّع"}
              </span>
            </Link>
          ) : (
            <form action={generateContractAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="flex w-full flex-col items-center gap-1 rounded-[var(--radius-card)] border border-dashed border-line bg-paper p-4 text-center"
              >
                <FileText className="size-5 text-ink-soft" />
                <span className="text-xs font-semibold text-ink">
                  إنشاء عقد
                </span>
              </button>
            </form>
          )}

          {invoice ? (
            <Link
              href={`/invoices/${invoice.id}`}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-line bg-paper p-4 text-center"
            >
              <Receipt className="size-5 text-gold" />
              <span className="text-xs font-semibold text-ink">
                فاتورة {invoice.invoiceNumber}
              </span>
              <span className="text-[10px] text-ink-soft">
                {invoice.status === "DRAFT"
                  ? "مسودة"
                  : invoice.status === "ISSUED"
                    ? "صادرة"
                    : invoice.status === "PAID"
                      ? "مدفوعة"
                      : "ملغاة"}
              </span>
            </Link>
          ) : (
            <form action={generateInvoiceAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="flex w-full flex-col items-center gap-1 rounded-[var(--radius-card)] border border-dashed border-line bg-paper p-4 text-center"
              >
                <Receipt className="size-5 text-ink-soft" />
                <span className="text-xs font-semibold text-ink">
                  إنشاء فاتورة
                </span>
              </button>
            </form>
          )}
        </div>

        <BookingVendors
          bookingId={booking.id}
          locale={locale}
          vendors={bookingVendors.map((v) => ({
            id: v.id,
            category: v.category,
            name: v.name,
            phone: v.phone,
            contactPerson: v.contactPerson,
            status: v.status,
            costFils: v.costFils,
            notes: v.notes,
          }))}
          directory={vendorDirectory.map((v) => ({
            id: v.id,
            name: v.name,
            category: v.category,
            phone: v.phone,
          }))}
        />

        {booking.terms ? (
          <Panel title="شروط الحجز">{booking.terms}</Panel>
        ) : null}
        {booking.notes ? (
          <Panel title="ملاحظات داخلية">{booking.notes}</Panel>
        ) : null}
        {booking.status === "CANCELLED" && booking.cancellationReason ? (
          <Panel title="سبب الإلغاء">{booking.cancellationReason}</Panel>
        ) : null}

        {waitlistMatches.length > 0 ? (
          <div className="rounded-[var(--radius-card)] border border-gold-soft bg-gold-soft/30 p-4">
            <h3 className="mb-2 font-kufi text-sm font-bold text-ink">
              {formatNumber(waitlistMatches.length, locale)} على قائمة الانتظار
              لهذا الموعد
            </h3>
            <ul className="space-y-1.5">
              {waitlistMatches.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{w.client?.name ?? w.contactName}</span>
                  <a
                    href={waLink(
                      w.client?.phone ?? w.contactPhone ?? "",
                      `مرحباً، تحرّر موعد ${dateText} في ${org.name}. تحب نحجزه لك؟`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-olive"
                  >
                    تواصل
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
          <h3 className="mb-2 font-kufi text-sm font-bold text-ink">إجراءات</h3>
          <BookingStatusActions
            bookingId={booking.id}
            status={booking.status}
          />
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <dt className="text-[11px] text-ink-soft">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
      {sub ? <dd className="text-[11px] text-ink-soft">{sub}</dd> : null}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
      <h3 className="mb-1 font-kufi text-sm font-bold text-ink">{title}</h3>
      <p className="whitespace-pre-wrap text-sm text-ink-soft">{children}</p>
    </div>
  );
}
