"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { BookingStatus } from "@prisma/client";
import { transitionBookingAction } from "@/app/actions/bookings";
import { allowedTransitions } from "@/lib/bookings/status";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, TextInput } from "@/components/ui/Field";

const LABEL_KEY: Record<BookingStatus, string> = {
  HOLD: "toHold",
  CONFIRMED: "toConfirmed",
  CANCELLED: "cancel",
  COMPLETED: "toCompleted",
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
  const t = useTranslations("bookings.statusActions");
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
          .filter((target) => target !== "CANCELLED")
          .map((target) => (
            <form key={target} action={action} className="flex-1">
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="to" value={target} />
              <Button
                type="submit"
                size="sm"
                variant={VARIANT[target] ?? "secondary"}
                disabled={pending}
                className="w-full"
              >
                {t(LABEL_KEY[target])}
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
              placeholder={t("cancelReasonPlaceholder")}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                variant="wine"
                disabled={pending}
                className="flex-1"
              >
                {t("confirmCancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setConfirmCancel(false)}
                className="flex-1"
              >
                {t("revert")}
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="w-full py-2 text-center text-sm font-semibold text-wine"
          >
            {t("cancel")}
          </button>
        )
      ) : null}
    </div>
  );
}
