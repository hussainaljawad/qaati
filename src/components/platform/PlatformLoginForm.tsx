"use client";

import { useActionState } from "react";
import { platformLoginAction } from "@/app/actions/platform";
import { emptyForm } from "@/lib/forms";

export function PlatformLoginForm() {
  const [state, action, pending] = useActionState(
    platformLoginAction,
    emptyForm,
  );

  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <p className="rounded-lg bg-wine-soft px-3 py-2 text-sm font-medium text-wine">
          {state.error}
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-xs text-ink-soft">البريد</label>
        <input
          name="email"
          type="email"
          dir="ltr"
          required
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-soft">كلمة المرور</label>
        <input
          name="password"
          type="password"
          dir="ltr"
          required
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gold py-2.5 text-sm font-bold text-ink disabled:opacity-50"
      >
        {pending ? "…" : "دخول"}
      </button>
    </form>
  );
}
