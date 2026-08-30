"use client";

import { useActionState, useEffect, useState } from "react";
import {
  addInstallmentAction,
  applyPlanPresetAction,
  deleteInstallmentAction,
  recordPaymentAction,
  waivePaymentAction,
} from "@/app/actions/payments";
import { emptyForm } from "@/lib/forms";
import { filsToBhd, formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";
import {
  PAYMENT_KIND_LABEL,
  PAYMENT_METHOD_LABEL,
  PLAN_PRESETS,
  effectivePaymentStatus,
  summarizePayments,
} from "@/lib/payments/plan";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";

type P = {
  id: string;
  kind: "DEPOSIT" | "MILESTONE" | "FINAL" | "REFUND" | "OTHER";
  amountFils: number;
  dueDate: string | null;
  paidAt: string | null;
  method: string | null;
  status: "DUE" | "PAID" | "OVERDUE" | "WAIVED";
  reference: string | null;
  recordedByName: string | null;
};

const STATUS_META = {
  PAID: { label: "مدفوعة", cls: "text-olive" },
  OVERDUE: { label: "متأخرة", cls: "text-wine" },
  DUE: { label: "مستحقة", cls: "text-ink-soft" },
  WAIVED: { label: "معفاة", cls: "text-ink-soft line-through" },
} as const;

export function PaymentPlan({
  bookingId,
  netFils,
  payments,
  locale,
}: {
  bookingId: string;
  netFils: number;
  payments: P[];
  locale: Locale;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [recordFor, setRecordFor] = useState<string | null>(null);

  const summary = summarizePayments(
    netFils,
    payments.map((p) => ({
      amountFils: p.amountFils,
      status: p.status,
      dueDate: p.dueDate ? new Date(p.dueDate) : null,
      kind: p.kind,
    })),
  );

  const [presetState, presetAction, presetPending] = useActionState(
    applyPlanPresetAction,
    emptyForm,
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-4">
      <h3 className="mb-3 font-kufi text-sm font-bold text-ink">خطة الدفع</h3>

      {/* ملخّص */}
      <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <Row label="الصافي" value={formatMoney(summary.netFils, locale)} />
        <Row
          label="المدفوع"
          value={formatMoney(summary.paidFils, locale)}
          tone="olive"
        />
        <Row
          label="المتبقي"
          value={formatMoney(summary.remainingFils, locale)}
          tone={summary.remainingFils > 0 ? "wine" : "olive"}
          bold
        />
        {summary.overdueFils > 0 ? (
          <Row
            label="متأخر"
            value={formatMoney(summary.overdueFils, locale)}
            tone="wine"
          />
        ) : null}
      </dl>

      {/* الأقساط */}
      {payments.length > 0 ? (
        <ul className="mb-3 divide-y divide-line rounded-xl border border-line">
          {payments.map((p) => {
            const st = p.dueDate
              ? effectivePaymentStatus({
                  status: p.status,
                  dueDate: new Date(p.dueDate),
                })
              : p.status;
            const meta = STATUS_META[st];
            return (
              <li key={p.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {PAYMENT_KIND_LABEL[p.kind]} ·{" "}
                      {formatMoney(p.amountFils, locale)}
                    </p>
                    <p className={`text-[11px] ${meta.cls}`}>
                      {meta.label}
                      {p.status === "PAID" && p.paidAt
                        ? ` · ${formatDate(p.paidAt, locale, { day: "numeric", month: "short" })}${p.method ? ` · ${PAYMENT_METHOD_LABEL[p.method] ?? p.method}` : ""}`
                        : p.dueDate
                          ? ` · استحقاق ${formatDate(p.dueDate, locale, { day: "numeric", month: "short" })}`
                          : ""}
                    </p>
                  </div>
                  {p.status !== "PAID" && p.status !== "WAIVED" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRecordFor(recordFor === p.id ? null : p.id)
                      }
                      className="shrink-0 rounded-lg bg-gold px-2.5 py-1.5 text-[11px] font-semibold text-ink"
                    >
                      تسجيل دفعة
                    </button>
                  ) : null}
                </div>

                {recordFor === p.id ? (
                  <RecordForm payment={p} onDone={() => setRecordFor(null)} />
                ) : null}

                {p.status !== "PAID" ? (
                  <div className="mt-2 flex gap-3 text-[11px] font-medium">
                    <form action={waivePaymentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-ink-soft">
                        {p.status === "WAIVED" ? "إلغاء الإعفاء" : "إعفاء"}
                      </button>
                    </form>
                    <form action={deleteInstallmentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-wine">
                        حذف
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mb-3 space-y-2">
          {presetState.error ? (
            <FormError>{presetState.error}</FormError>
          ) : null}
          <p className="text-xs text-ink-soft">اختر خطة جاهزة:</p>
          {PLAN_PRESETS.map((preset) => (
            <form key={preset.id} action={presetAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="presetId" value={preset.id} />
              <button
                type="submit"
                disabled={presetPending}
                className="w-full rounded-xl border border-line bg-paper-2 px-3 py-2.5 text-start text-sm font-medium text-ink disabled:opacity-50"
              >
                {preset.label}
              </button>
            </form>
          ))}
        </div>
      )}

      {/* إضافة قسط */}
      {addOpen ? (
        <AddInstallmentForm
          bookingId={bookingId}
          onDone={() => setAddOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-xs font-semibold text-gold"
        >
          + إضافة قسط يدوي
        </button>
      )}
    </div>
  );
}

function RecordForm({ payment, onDone }: { payment: P; onDone: () => void }) {
  const [state, action, pending] = useActionState(
    recordPaymentAction,
    emptyForm,
  );
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="mt-2 space-y-2 rounded-xl border border-gold-soft bg-gold-soft/20 p-3"
    >
      {state.error ? <FormError>{state.error}</FormError> : null}
      <input type="hidden" name="paymentId" value={payment.id} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="المبلغ (د.ب)" error={fe.amountBhd}>
          <TextInput
            name="amountBhd"
            type="number"
            dir="ltr"
            step="0.001"
            defaultValue={filsToBhd(payment.amountFils) || ""}
            required
          />
        </Field>
        <Field label="التاريخ" error={fe.paidDate}>
          <TextInput
            name="paidDate"
            type="date"
            dir="ltr"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </Field>
      </div>
      <Field label="الطريقة" error={fe.method}>
        <Select name="method" defaultValue="BENEFIT">
          {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="مرجع/رقم العملية" error={fe.reference}>
        <TextInput name="reference" dir="ltr" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? "…" : "تأكيد"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onDone}
          className="flex-1"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}

function AddInstallmentForm({
  bookingId,
  onDone,
}: {
  bookingId: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(
    addInstallmentAction,
    emptyForm,
  );
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);
  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={action}
      className="mt-2 space-y-2 rounded-xl border border-line bg-paper-2/40 p-3"
    >
      {state.error ? <FormError>{state.error}</FormError> : null}
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="النوع" error={fe.kind}>
          <Select name="kind" defaultValue="MILESTONE">
            <option value="DEPOSIT">عربون</option>
            <option value="MILESTONE">دفعة وسط</option>
            <option value="FINAL">تسديد نهائي</option>
            <option value="OTHER">أخرى</option>
          </Select>
        </Field>
        <Field label="المبلغ (د.ب)" error={fe.amountBhd}>
          <TextInput
            name="amountBhd"
            type="number"
            dir="ltr"
            step="0.001"
            required
          />
        </Field>
      </div>
      <Field label="تاريخ الاستحقاق" error={fe.dueDate}>
        <TextInput name="dueDate" type="date" dir="ltr" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? "…" : "إضافة"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onDone}
          className="flex-1"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "olive" | "wine";
}) {
  const c =
    tone === "olive"
      ? "text-olive"
      : tone === "wine"
        ? "text-wine"
        : "text-ink";
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={`${bold ? "font-bold" : "font-medium"} ${c}`}>{value}</dd>
    </div>
  );
}
