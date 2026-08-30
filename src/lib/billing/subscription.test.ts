import { describe, expect, it } from "vitest";
import { effectiveStatus, isUsable, trialDaysLeft } from "./subscription";

const now = new Date("2026-08-29T12:00:00Z");

describe("effectiveStatus", () => {
  it("لا اشتراك ⇒ NONE", () => {
    expect(effectiveStatus(null, now)).toBe("NONE");
  });

  it("تجربة سارية تبقى TRIALING", () => {
    expect(
      effectiveStatus(
        {
          status: "TRIALING",
          trialEndsAt: new Date("2026-09-05"),
          currentPeriodEnd: null,
        },
        now,
      ),
    ).toBe("TRIALING");
  });

  it("تجربة منتهية ⇒ EXPIRED", () => {
    expect(
      effectiveStatus(
        {
          status: "TRIALING",
          trialEndsAt: new Date("2026-08-20"),
          currentPeriodEnd: null,
        },
        now,
      ),
    ).toBe("EXPIRED");
  });

  it("اشتراك فعّال داخل الفترة يبقى ACTIVE", () => {
    expect(
      effectiveStatus(
        {
          status: "ACTIVE",
          trialEndsAt: null,
          currentPeriodEnd: new Date("2026-09-29"),
        },
        now,
      ),
    ).toBe("ACTIVE");
  });

  it("اشتراك فعّال انتهت فترته ⇒ PAST_DUE", () => {
    expect(
      effectiveStatus(
        {
          status: "ACTIVE",
          trialEndsAt: null,
          currentPeriodEnd: new Date("2026-08-01"),
        },
        now,
      ),
    ).toBe("PAST_DUE");
  });
});

describe("isUsable", () => {
  it("TRIALING / ACTIVE / PAST_DUE قابلة للاستخدام", () => {
    expect(isUsable("TRIALING")).toBe(true);
    expect(isUsable("ACTIVE")).toBe(true);
    expect(isUsable("PAST_DUE")).toBe(true);
  });
  it("EXPIRED / CANCELLED / NONE غير قابلة", () => {
    expect(isUsable("EXPIRED")).toBe(false);
    expect(isUsable("CANCELLED")).toBe(false);
    expect(isUsable("NONE")).toBe(false);
  });
});

describe("trialDaysLeft", () => {
  it("يقرّب لأعلى ويصفّر بعد الانتهاء", () => {
    expect(
      trialDaysLeft(
        { status: "TRIALING", trialEndsAt: new Date("2026-09-01T00:00:00Z") },
        now,
      ),
    ).toBe(3);
    expect(
      trialDaysLeft(
        { status: "TRIALING", trialEndsAt: new Date("2026-08-01") },
        now,
      ),
    ).toBe(0);
    expect(trialDaysLeft({ status: "ACTIVE", trialEndsAt: null }, now)).toBe(0);
  });
});
