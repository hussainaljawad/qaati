/**
 * طبقة تحصيل الدفعات — قابلة للتوسعة.
 * اليوم: تسجيل يدوي (ManualPaymentProvider).
 * لاحقاً: BenefitPayProvider / TapProvider عبر src/app/api/payments/[provider]/webhook.
 */
import type { PaymentMethod } from "@prisma/client";

export interface RecordPaymentInput {
  paymentId: string;
  amountFils: number;
  method: PaymentMethod;
  paidAt: Date;
  reference?: string;
  note?: string;
}

export interface ChargeRequest {
  organizationId: string;
  bookingId: string;
  amountFils: number;
  description: string;
}

export interface ChargeResult {
  /** رابط دفع يُوجَّه إليه العميل (null في المزوّد اليدوي). */
  url: string | null;
  providerRef: string | null;
}

export interface PaymentProvider {
  readonly id: string;
  /** يبدأ عملية دفع إلكترونية (غير مفعّل بعد). */
  createCharge(req: ChargeRequest): Promise<ChargeResult>;
}

class ManualPaymentProvider implements PaymentProvider {
  readonly id = "manual";
  async createCharge(): Promise<ChargeResult> {
    return { url: null, providerRef: null };
  }
}

export const paymentProvider: PaymentProvider = new ManualPaymentProvider();
