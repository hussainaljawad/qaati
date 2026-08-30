import type { ComponentProps, ReactNode } from "react";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-gold focus:ring-2 focus:ring-gold/25";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-ink">
        {label}
        {hint ? (
          <span className="font-normal text-ink-soft">{hint}</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-wine">{error}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={`${inputClass} ${className ?? ""}`} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select className={`${inputClass} ${className ?? ""}`} {...props}>
      {children}
    </select>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg bg-wine-soft px-3 py-2 text-xs font-medium text-wine">
      {children}
    </p>
  );
}
