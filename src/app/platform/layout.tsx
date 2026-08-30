import type { Metadata } from "next";

export const metadata: Metadata = { title: "لوحة المشغّل · قاعتي" };

/** تخطيط لوحة المشغّل — نفس ألوان قاعتي الفاتحة، مع شريط علوي مميّز. */
export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-paper-2 text-ink">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
