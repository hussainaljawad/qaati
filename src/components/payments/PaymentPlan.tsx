"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  PLAN_PRESETS,
  effectivePaymentStatus,
  summarizePayments,
} from "@/lib/payments/plan";
import { getLabels } from "@/lib/labels";
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

const PRESET_KEY: Record<string, string> = {
  "deposit-final": "depositFinal",
  "three-parts": "threeParts",
  "half-half": "halfHalf",
};

const STATUS_CLS: Record<string, string> = {
  PAID: "text-olive",
  OVERDUE: "text-wine",
  DUE: "text-ink-soft",
  WAIVED: "text-ink-soft line-through",
};

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
  const t = useTranslations("payments");
  const tc = useTranslations("common");
  const labels = getLabels(locale);
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
      <h3 className="mb-3 font-kufi text-sm font-bold text-ink">
        {t("title")}
      </h3>

      <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <Row label={t("net")} value={formatMoney(summary.netFils, locale)} />
        <Row
          label={t("paid")}
          value={formatMoney(summary.paidFils, locale)}
          tone="olive"
        />
        <Row
          label={t("remaining")}
          value={formatMoney(summary.remainingFils, locale)}
          tone={summary.remainingFils > 0 ? "wine" : "olive"}
          bold
        />
        {summary.overdueFils > 0 ? (
          <Row
            label={t("overdue")}
            value={formatMoney(summary.overdueFils, locale)}
            tone="wine"
          />
        ) : null}
      </dl>

      {payments.length > 0 ? (
        <ul className="mb-3 divide-y divide-line rounded-xl border border-line">
          {payments.map((p) => {
            const st = p.dueDate
              ? effectivePaymentStatus({
                  status: p.status,
                  dueDate: new Date(p.dueDate),
                })
              : p.status;
            return (
              <li key={p.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {labels.paymentKind[p.kind]} ·{" "}
                      {formatMoney(p.amountFils, locale)}
                    </p>
                    <p className={`text-[11px] ${STATUS_CLS[st]}`}>
                      {labels.paymentStatus[st]}
                      {p.status === "PAID" && p.paidAt
                        ? ` · ${formatDate(p.paidAt, locale, { day: "numeric", month: "short" })}${p.method ? ` · ${labels.paymentMethod[p.method as keyof typeof labels.paymentMethod] ?? p.method}` : ""}`
                        : p.dueDate
                          ? ` · ${t("dueOn", { date: formatDate(p.dueDate, locale, { day: "numeric", month: "short" }) })}`
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
                      {t("recordPayment")}
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
                        {p.status === "WAIVED" ? t("unwaive") : t("waive")}
                      </button>
                    </form>
                    <form action={deleteInstallmentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-wine">
                        {tc("delete")}
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
          <p className="text-xs text-ink-soft">{t("pickPreset")}</p>
          {PLAN_PRESETS.map((preset) => (
            <form key={preset.id} action={presetAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="presetId" value={preset.id} />
              <button
                type="submit"
                disabled={presetPending}
                className="w-full rounded-xl border border-line bg-paper-2 px-3 py-2.5 text-start text-sm font-medium text-ink disabled:opacity-50"
              >
                {t(`presets.${PRESET_KEY[preset.id] ?? "depositFinal"}`)}
              </button>
            </form>
          ))}
        </div>
      )}

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
          {t("addManual")}
        </button>
      )}
    </div>
  );
}

function RecordForm({ payment, onDone }: { payment: P; onDone: () => void }) {
  const t = useTranslations("payments.recordForm");
  const tc = useTranslations("common");
  const labels = getLabels(useLocale() as Locale).paymentMethod;
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
        <Field label={t("amount")} error={fe.amountBhd}>
          <TextInput
            name="amountBhd"
            type="number"
            dir="ltr"
            step="0.001"
            defaultValue={filsToBhd(payment.amountFils) || ""}
            required
          />
        </Field>
        <Field label={t("date")} error={fe.paidDate}>
          <TextInput
            name="paidDate"
            type="date"
            dir="ltr"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </Field>
      </div>
      <Field label={t("method")} error={fe.method}>
        <Select name="method" defaultValue="BENEFIT">
          {Object.entries(labels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("reference")} error={fe.reference}>
        <TextInput name="reference" dir="ltr" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? "…" : t("confirm")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onDone}
          className="flex-1"
        >
          {tc("cancel")}
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
  const t = useTranslations("payments.addForm");
  const tc = useTranslations("common");
  const kindLabels = getLabels(useLocale() as Locale).paymentKind;
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
        <Field label={t("kind")} error={fe.kind}>
          <Select name="kind" defaultValue="MILESTONE">
            <option value="DEPOSIT">{kindLabels.DEPOSIT}</option>
            <option value="MILESTONE">{kindLabels.MILESTONE}</option>
            <option value="FINAL">{kindLabels.FINAL}</option>
            <option value="OTHER">{kindLabels.OTHER}</option>
          </Select>
        </Field>
        <Field label={t("amount")} error={fe.amountBhd}>
          <TextInput
            name="amountBhd"
            type="number"
            dir="ltr"
            step="0.001"
            required
          />
        </Field>
      </div>
      <Field label={t("dueDate")} error={fe.dueDate}>
        <TextInput name="dueDate" type="date" dir="ltr" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? "…" : t("add")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onDone}
          className="flex-1"
        >
          {tc("cancel")}
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
