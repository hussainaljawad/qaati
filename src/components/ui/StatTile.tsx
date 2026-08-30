type Accent = "gold" | "wine" | "olive";

const accents: Record<Accent, string> = {
  gold: "text-gold",
  wine: "text-wine",
  olive: "text-olive",
};

export function StatTile({
  value,
  label,
  accent = "gold",
}: {
  value: string;
  label: string;
  accent?: Accent;
}) {
  return (
    <div className="rounded-[var(--radius-tile)] border border-line bg-paper px-2.5 py-3 text-center">
      <div className={`font-kufi text-lg font-bold ${accents[accent]}`}>
        {value}
      </div>
      <div className="mt-1 text-[10.5px] leading-tight text-ink-soft">
        {label}
      </div>
    </div>
  );
}
