import { describe, expect, it } from "vitest";
import { bhdToFils, filsToBhd, formatMoney, sumFils } from "./money";

describe("bhdToFils", () => {
  it("يحوّل دينار إلى فلس صحيح", () => {
    expect(bhdToFils(1)).toBe(1000);
    expect(bhdToFils(1.1)).toBe(1100);
    expect(bhdToFils("1,100.500")).toBe(1_100_500);
    expect(bhdToFils(0.001)).toBe(1);
  });
  it("يتعامل مع المدخل غير الصالح كصفر", () => {
    expect(bhdToFils("abc")).toBe(0);
  });
});

describe("filsToBhd", () => {
  it("يقسم على ١٠٠٠", () => {
    expect(filsToBhd(1_100_000)).toBe(1100);
  });
});

describe("formatMoney", () => {
  it("يعرض ٣ خانات عشرية مع رمز الدينار", () => {
    const out = formatMoney(1_100_000, "ar");
    expect(out).toContain("د.ب");
  });
  it("بدون رمز عند الطلب", () => {
    expect(formatMoney(1_000_000, "en", { withSymbol: false })).not.toContain(
      "BHD",
    );
  });
});

describe("sumFils", () => {
  it("يجمع ويتجاهل null", () => {
    expect(sumFils([100, null, 200, undefined])).toBe(300);
  });
});
