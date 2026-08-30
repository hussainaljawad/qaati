"use client";

import { useActionState, useState } from "react";
import type { BookingStatus } from "@prisma/client";
import { transitionBookingAction } from "@/app/actions/bookings";
import { allowedTransitions } from "@/lib/bookings/status";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, TextInput } from "@/components/ui/Field";

const LABEL: Record<BookingStatus, string> = {
  HOLD: "رجوع لمبدئي",
  CONFIRMED: "تأكيد الحجز",
  CANCELLED: "إلغاء",
  COMPLETED: "تعليم كمكتمل",
};

const VARIANT: Partial<
  Record<BookingStatus, "primary" | "secondary" | "wine">
> = {
  CONFIRMED: "primary",
  COMPLETED: "secondary",
  HOLD: "secondary",
  CANCELLED: "wine",
};

export function BookingStatusActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [state, action, pending] = useActionState(
    transitionBookingAction,
    emptyForm,
  );
  const [confirmCancel, setConfirmCancel] = useState(false);
  const targets = allowedTransitions(status);

  if (targets.length === 0) return null;

  return (
    <div className="space-y-2">
      {state.error ? <FormError>{state.error}</FormError> : null}

      <div className="flex flex-wrap gap-2">
        {targets
          .filter((t) => t !== "CANCELLED")
          .map((t) => (
            <form key={t} action={action} className="flex-1">
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="to" value={t} />
              <Button
                type="submit"
                size="sm"
                variant={VARIANT[t] ?? "secondary"}
                disabled={pending}
                className="w-full"
              >
                {LABEL[t]}
              </Button>
            </form>
          ))}
      </div>

      {targets.includes("CANCELLED") ? (
        confirmCancel ? (
          <form
            action={action}
            className="space-y-2 rounded-xl border border-wine-soft bg-wine-soft/30 p-3"
          >
            <input type="hidden" name="bookingId" value={bookingId} />
            <input type="hidden" name="to" value="CANCELLED" />
            <TextInput
              name="cancellationReason"
              placeholder="سبب الإلغاء (اختياري)"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                variant="wine"
                disabled={pending}
                className="flex-1"
              >
                تأكيد الإلغاء
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setConfirmCancel(false)}
                className="flex-1"
              >
                تراجع
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="w-full py-2 text-center text-sm font-semibold text-wine"
          >
            إلغاء الحجز
          </button>
        )
      ) : null}
    </div>
  );
}
