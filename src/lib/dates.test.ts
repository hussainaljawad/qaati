import { describe, expect, it } from "vitest";
import {
  isTodayOrFuture,
  parseDateOnly,
  startOfDayUtc,
  toDateOnlyString,
} from "./dates";

describe("parseDateOnly", () => {
  it("يحلّل تاريخاً صحيحاً عند منتصف ليل UTC", () => {
    const d = parseDateOnly("2026-09-15");
    expect(d?.toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });
  it("يرفض الصيغ الخاطئة", () => {
    expect(parseDateOnly("15/09/2026")).toBeNull();
    expect(parseDateOnly("2026-13-40")).toBeNull();
    expect(parseDateOnly("")).toBeNull();
  });
});

describe("toDateOnlyString", () => {
  it("يرجّع YYYY-MM-DD", () => {
    expect(toDateOnlyString(new Date("2026-09-15T22:00:00.000Z"))).toBe(
      "2026-09-15",
    );
  });
});

describe("startOfDayUtc / isTodayOrFuture", () => {
  it("يثبّت على بداية اليوم UTC", () => {
    const d = startOfDayUtc(new Date("2026-09-15T18:30:00.000Z"));
    expect(d.toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });
  it("الماضي ليس اليوم-أو-المستقبل", () => {
    expect(isTodayOrFuture(new Date("2000-01-01"))).toBe(false);
    expect(isTodayOrFuture(new Date(Date.now() + 86400000))).toBe(true);
  });
});
