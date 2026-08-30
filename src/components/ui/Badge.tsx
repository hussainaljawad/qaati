import type { ReactNode } from "react";

type Tone = "gold" | "wine" | "olive" | "neutral" | "ink";

const tones: Record<Tone, string> = {
  gold: "bg-gold-soft text-gold",
  wine: "bg-wine-soft text-wine",
  olive: "bg-olive-soft text-olive",
  neutral: "bg-paper-2 text-ink-soft",
  ink: "bg-ink text-paper",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
