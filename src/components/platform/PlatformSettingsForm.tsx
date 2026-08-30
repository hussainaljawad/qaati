"use client";

import { useActionState } from "react";
import { updatePlatformSettingsAction } from "@/app/actions/platform";
import { emptyForm } from "@/lib/forms";
import { filsToBhd } from "@/lib/money";

type Settings = {
  planNameAr: string;
  planNameEn: string;
  priceMonthlyFils: number;
  priceYearlyFils: number;
  bankName: string | null;
  bankAccountName: string | null;
  bankIban: string | null;
  bankAccountNumber: string | null;
  benefitNumber: string | null;
  paymentNote: string | null;
};

export function PlatformSettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(
    updatePlatformSettingsAction,
    emptyForm,
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg bg-wine-soft px-3 py-2 text-sm font-medium text-wine">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg bg-olive-soft px-3 py-2 text-sm font-medium text-olive">
          {state.message}
        </p>
      ) : null}

      {/* الباقة */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-3 font-kufi text-sm font-bold text-ink">
          الباقة والسعر
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="اسم الباقة (عربي)" error={fe.planNameAr}>
            <input
              name="planNameAr"
              defaultValue={settings.planNameAr}
              required
              className={inp}
            />
          </F>
          <F label="اسم الباقة (إنجليزي)" error={fe.planNameEn}>
            <input
              name="planNameEn"
              defaultValue={settings.planNameEn}
              dir="ltr"
              required
              className={inp}
            />
          </F>
          <F label="السعر الشهري (د.ب)" error={fe.priceMonthlyBhd}>
            <input
              name="priceMonthlyBhd"
              type="number"
              step="0.001"
              min={0}
              dir="ltr"
              defaultValue={filsToBhd(settings.priceMonthlyFils)}
              required
              className={inp}
            />
          </F>
          <F label="السعر السنوي (د.ب)" error={fe.priceYearlyBhd}>
            <input
              name="priceYearlyBhd"
              type="number"
              step="0.001"
              min={0}
              dir="ltr"
              defaultValue={filsToBhd(settings.priceYearlyFils)}
              required
              className={inp}
            />
          </F>
        </div>
      </section>

      {/* حساب البنك */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-1 font-kufi text-sm font-bold text-ink">
          حساب البنك للتحويل
        </h2>
        <p className="mb-3 text-xs text-ink-soft">
          تظهر هذه البيانات للمشترك في صفحة الاشتراك عند طلب التفعيل.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="اسم البنك" error={fe.bankName}>
            <input
              name="bankName"
              defaultValue={settings.bankName ?? ""}
              className={inp}
            />
          </F>
          <F label="اسم صاحب الحساب" error={fe.bankAccountName}>
            <input
              name="bankAccountName"
              defaultValue={settings.bankAccountName ?? ""}
              className={inp}
            />
          </F>
          <F label="الآيبان (IBAN)" error={fe.bankIban}>
            <input
              name="bankIban"
              dir="ltr"
              defaultValue={settings.bankIban ?? ""}
              className={inp}
            />
          </F>
          <F label="رقم الحساب" error={fe.bankAccountNumber}>
            <input
              name="bankAccountNumber"
              dir="ltr"
              defaultValue={settings.bankAccountNumber ?? ""}
              className={inp}
            />
          </F>
          <F label="رقم بنفت / BenefitPay" error={fe.benefitNumber}>
            <input
              name="benefitNumber"
              dir="ltr"
              defaultValue={settings.benefitNumber ?? ""}
              className={inp}
            />
          </F>
        </div>
        <div className="mt-3">
          <F label="ملاحظة تظهر للمشترك" error={fe.paymentNote}>
            <textarea
              name="paymentNote"
              rows={2}
              defaultValue={settings.paymentNote ?? ""}
              className={inp}
            />
          </F>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-paper disabled:opacity-50"
      >
        {pending ? "…" : "حفظ"}
      </button>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-line bg-paper-2 px-3 py-2.5 text-sm outline-none focus:border-gold";

function F({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-0.5 block text-[11px] text-wine">{error}</span>
      ) : null}
    </label>
  );
}
