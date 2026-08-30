/**
 * حساب ضريبة القيمة المضافة (البحرين ١٠٪). كل المبالغ بالفلس (أعداد صحيحة).
 */

export interface VatBreakdown {
  subtotalFils: number; // قبل الضريبة
  vatFils: number;
  totalFils: number; // شامل الضريبة
}

/**
 * @param amountFils المبلغ المتفق عليه
 * @param ratePercent نسبة الضريبة (مثلاً 10)
 * @param inclusive هل المبلغ المتفق عليه شامل الضريبة؟
 */
export function computeVat(
  amountFils: number,
  ratePercent: number,
  inclusive: boolean,
): VatBreakdown {
  if (ratePercent <= 0) {
    return { subtotalFils: amountFils, vatFils: 0, totalFils: amountFils };
  }
  if (inclusive) {
    const subtotal = Math.round(amountFils / (1 + ratePercent / 100));
    return {
      subtotalFils: subtotal,
      vatFils: amountFils - subtotal,
      totalFils: amountFils,
    };
  }
  const vat = Math.round((amountFils * ratePercent) / 100);
  return {
    subtotalFils: amountFils,
    vatFils: vat,
    totalFils: amountFils + vat,
  };
}

/** يجمع بنود فاتورة (كل بند مبلغه قبل الضريبة) ويحسب الإجمالي. */
export function sumLineItems(
  lines: { amountFils: number }[],
  ratePercent: number,
): VatBreakdown {
  const subtotal = lines.reduce((s, l) => s + l.amountFils, 0);
  return computeVat(subtotal, ratePercent, false);
}
