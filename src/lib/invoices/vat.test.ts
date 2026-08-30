import { describe, expect, it } from "vitest";
import { computeVat, sumLineItems } from "./vat";

describe("computeVat", () => {
  it("سعر شامل الضريبة ١٠٪: يستخرج القاعدة والضريبة", () => {
    // 1100.000 د.ب شامل ⇒ قاعدة 1000.000 + ضريبة 100.000
    const r = computeVat(1_100_000, 10, true);
    expect(r.subtotalFils).toBe(1_000_000);
    expect(r.vatFils).toBe(100_000);
    expect(r.totalFils).toBe(1_100_000);
  });

  it("سعر غير شامل: يضيف الضريبة", () => {
    const r = computeVat(1_000_000, 10, false);
    expect(r.subtotalFils).toBe(1_000_000);
    expect(r.vatFils).toBe(100_000);
    expect(r.totalFils).toBe(1_100_000);
  });

  it("نسبة صفر: بلا ضريبة", () => {
    const r = computeVat(500_000, 0, true);
    expect(r).toEqual({
      subtotalFils: 500_000,
      vatFils: 0,
      totalFils: 500_000,
    });
  });

  it("القاعدة + الضريبة = الإجمالي دائماً (بلا كسور ضائعة)", () => {
    for (const amt of [333_333, 1_000_001, 777_777, 12_345]) {
      const r = computeVat(amt, 10, true);
      expect(r.subtotalFils + r.vatFils).toBe(r.totalFils);
      expect(r.totalFils).toBe(amt);
    }
  });
});

describe("sumLineItems", () => {
  it("يجمع البنود ويحسب الضريبة عليها", () => {
    const r = sumLineItems(
      [{ amountFils: 600_000 }, { amountFils: 400_000 }],
      10,
    );
    expect(r.subtotalFils).toBe(1_000_000);
    expect(r.vatFils).toBe(100_000);
    expect(r.totalFils).toBe(1_100_000);
  });
});
