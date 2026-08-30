import { describe, expect, it } from "vitest";
import {
  effectivePaymentStatus,
  splitByRatio,
  summarizePayments,
} from "./plan";

const now = new Date("2026-08-29T12:00:00Z");

describe("effectivePaymentStatus", () => {
  it("مستحقة وتجاوزت الموعد ⇒ OVERDUE", () => {
    expect(
      effectivePaymentStatus(
        { status: "DUE", dueDate: new Date("2026-08-01") },
        now,
      ),
    ).toBe("OVERDUE");
  });
  it("مستحقة ولم يحن موعدها ⇒ DUE", () => {
    expect(
      effectivePaymentStatus(
        { status: "DUE", dueDate: new Date("2026-09-15") },
        now,
      ),
    ).toBe("DUE");
  });
  it("مدفوعة تبقى مدفوعة", () => {
    expect(
      effectivePaymentStatus(
        { status: "PAID", dueDate: new Date("2026-01-01") },
        now,
      ),
    ).toBe("PAID");
  });
});

describe("splitByRatio", () => {
  it("يوزّع بلا فقدان فلس (يصحّح في الأخير)", () => {
    const parts = splitByRatio(1_000_000, [0.3, 0.4, 0.3]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1_000_000);
  });
  it("يتعامل مع الكسور", () => {
    const parts = splitByRatio(1_000_001, [0.5, 0.5]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1_000_001);
  });
});

describe("summarizePayments", () => {
  const net = 1_000_000;
  it("خطة كاملة: عربون مدفوع + نهائي مستحق", () => {
    const s = summarizePayments(
      net,
      [
        { amountFils: 300_000, status: "PAID", dueDate: null, kind: "DEPOSIT" },
        {
          amountFils: 700_000,
          status: "DUE",
          dueDate: new Date("2026-09-20"),
          kind: "FINAL",
        },
      ],
      now,
    );
    expect(s.paidFils).toBe(300_000);
    expect(s.dueFils).toBe(700_000);
    expect(s.remainingFils).toBe(700_000);
    expect(s.fullyPaid).toBe(false);
  });

  it("قسط متأخر يُحسب في overdue", () => {
    const s = summarizePayments(
      net,
      [
        {
          amountFils: 500_000,
          status: "DUE",
          dueDate: new Date("2026-08-01"),
          kind: "DEPOSIT",
        },
      ],
      now,
    );
    expect(s.overdueFils).toBe(500_000);
  });

  it("الاسترجاع يخصم من المدفوع", () => {
    const s = summarizePayments(
      net,
      [
        { amountFils: 1_000_000, status: "PAID", dueDate: null, kind: "FINAL" },
        { amountFils: 200_000, status: "PAID", dueDate: null, kind: "REFUND" },
      ],
      now,
    );
    expect(s.paidFils).toBe(800_000);
  });

  it("fully paid عند تغطية الصافي", () => {
    const s = summarizePayments(
      net,
      [{ amountFils: 1_000_000, status: "PAID", dueDate: null, kind: "FINAL" }],
      now,
    );
    expect(s.fullyPaid).toBe(true);
    expect(s.remainingFils).toBe(0);
  });
});
