"use client";

import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { logWhatsappSendAction } from "@/app/actions/reminders";

/** يسجّل الإرسال في سجل التواصل ثم يفتح رابط واتساب في تبويب جديد. */
export function WhatsappSendButton({
  phone,
  body,
  clientId,
  bookingId,
  reminderKind,
  label = "إرسال عبر واتساب",
  variant = "solid",
}: {
  phone: string;
  body: string;
  clientId: string;
  bookingId?: string;
  reminderKind?:
    "BOOKING_CONFIRMATION" | "PAYMENT_DUE" | "EVENT_DAY_BEFORE" | "CUSTOM";
  label?: string;
  variant?: "solid" | "link";
}) {
  const [pending, start] = useTransition();

  function send() {
    const digits = phone.replace(/\D/g, "").replace(/^00/, "");
    const num = digits.length === 8 ? `973${digits}` : digits;
    const href = `https://wa.me/${num}?text=${encodeURIComponent(body)}`;
    start(async () => {
      await logWhatsappSendAction({ clientId, bookingId, body, reminderKind });
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="font-semibold text-olive disabled:opacity-50"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-olive px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
    >
      <MessageCircle className="size-4" />
      {label}
    </button>
  );
}
