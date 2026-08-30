"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signupAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

const initial: AuthState = {};

export function SignupForm({ trialDays }: { trialDays: number }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signupAction, initial);

  const errorText =
    state.message ?? (state.code ? t(`errors.${state.code}`) : undefined);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
      <h1 className="font-kufi text-xl font-bold text-ink">
        {t("signupTitle")}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {t("signupSubtitle", { days: trialDays })}
      </p>

      <form action={action} className="mt-5 space-y-3">
        {errorText ? <FormError>{errorText}</FormError> : null}

        <Field label={t("fullName")}>
          <TextInput name="name" autoComplete="name" required />
        </Field>
        <Field label={t("hallName")}>
          <TextInput name="hallName" required />
        </Field>
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
        <Field label={t("password")} hint={t("passwordHint")}>
          <TextInput
            name="password"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            minLength={8}
            required
          />
        </Field>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "…" : t("createAccount")}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-soft">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-gold">
          {t("goLogin")}
        </Link>
      </p>
    </div>
  );
}
