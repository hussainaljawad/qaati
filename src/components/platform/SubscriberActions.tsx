"use client";

import { useState } from "react";
import {
  activateOrgAction,
  expireOrgAction,
  extendOrgAction,
} from "@/app/actions/platform";

/** أزرار إدارة اشتراك منشأة — تفعيل / تمديد / إنهاء. */
export function SubscriberActions({
  orgId,
  status,
  compact = false,
}: {
  orgId: string;
  status: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-paper-2 px-2.5 py-1 text-xs font-semibold text-ink"
      >
        إدارة
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <form action={activateOrgAction}>
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="interval" value="monthly" />
        <button
          type="submit"
          className="rounded-lg bg-olive px-2.5 py-1 text-xs font-semibold text-white"
        >
          تفعيل شهر
        </button>
      </form>
      <form action={activateOrgAction}>
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="interval" value="yearly" />
        <button
          type="submit"
          className="rounded-lg bg-olive/80 px-2.5 py-1 text-xs font-semibold text-white"
        >
          تفعيل سنة
        </button>
      </form>
      <form action={extendOrgAction}>
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="kind" value="sub" />
        <input type="hidden" name="days" value="30" />
        <button
          type="submit"
          className="rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-ink"
        >
          +٣٠ يوم
        </button>
      </form>
      <form action={extendOrgAction}>
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="kind" value="trial" />
        <input type="hidden" name="days" value="7" />
        <button
          type="submit"
          className="rounded-lg bg-paper-2 px-2.5 py-1 text-xs font-semibold text-ink"
        >
          +٧ تجربة
        </button>
      </form>
      {status !== "EXPIRED" && status !== "NONE" ? (
        <form action={expireOrgAction}>
          <input type="hidden" name="orgId" value={orgId} />
          <button
            type="submit"
            className="rounded-lg bg-wine/80 px-2.5 py-1 text-xs font-semibold text-white"
          >
            إنهاء
          </button>
        </form>
      ) : null}
    </div>
  );
}
