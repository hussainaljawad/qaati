import { describe, expect, it } from "vitest";
import { allowedTransitions, canTransition, reactivates } from "./status";

describe("canTransition", () => {
  it("مبدئي ← مؤكد / ملغي فقط", () => {
    expect(canTransition("HOLD", "CONFIRMED")).toBe(true);
    expect(canTransition("HOLD", "CANCELLED")).toBe(true);
    expect(canTransition("HOLD", "COMPLETED")).toBe(false);
  });

  it("مؤكد ← مكتمل / ملغي فقط", () => {
    expect(canTransition("CONFIRMED", "COMPLETED")).toBe(true);
    expect(canTransition("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransition("CONFIRMED", "HOLD")).toBe(false);
  });

  it("ملغي يمكن إحياؤه", () => {
    expect(canTransition("CANCELLED", "HOLD")).toBe(true);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(true);
  });

  it("مكتمل نهائي", () => {
    expect(allowedTransitions("COMPLETED")).toHaveLength(0);
    expect(canTransition("COMPLETED", "CONFIRMED")).toBe(false);
  });

  it("لا انتقال لنفس الحالة", () => {
    expect(canTransition("HOLD", "HOLD")).toBe(false);
  });
});

describe("reactivates", () => {
  it("الرجوع لمبدئي/مؤكد يحتاج فحص تعارض", () => {
    expect(reactivates("HOLD")).toBe(true);
    expect(reactivates("CONFIRMED")).toBe(true);
    expect(reactivates("CANCELLED")).toBe(false);
    expect(reactivates("COMPLETED")).toBe(false);
  });
});
