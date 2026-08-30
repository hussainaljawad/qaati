"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

const initial: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(loginAction, initial);

  const errorText =
    state.message ?? (state.code ? t(`errors.${state.code}`) : undefined);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
      <h1 className="font-kufi text-xl font-bold text-ink">
        {t("loginTitle")}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{t("loginSubtitle")}</p>

      <form action={action} className="mt-5 space-y-3">
        {errorText ? <FormError>{errorText}</FormError> : null}
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <Field label={t("email")}>
          <TextInput
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            required
          />
        </Field>
        <Field label={t("password")}>
          <TextInput
            name="password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            required
          />
        </Field>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "…" : t("signIn")}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-soft">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-gold">
          {t("goSignup")}
        </Link>
      </p>
    </div>
  );
}
