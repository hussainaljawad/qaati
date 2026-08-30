import type { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-paper p-4 ${className ?? ""}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={`font-kufi text-sm font-semibold text-ink ${className ?? ""}`}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="font-kufi text-sm font-semibold text-ink">{title}</h2>
      {action}
    </div>
  );
}
