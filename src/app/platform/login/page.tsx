import { redirect } from "next/navigation";
import { getPlatformSession, isPlatformConfigured } from "@/lib/platform/auth";
import { PlatformLoginForm } from "@/components/platform/PlatformLoginForm";

export default async function PlatformLoginPage() {
  if (await getPlatformSession()) redirect("/platform");
  const configured = isPlatformConfigured();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <h1 className="mb-1 font-kufi text-xl font-bold">قاعتي · لوحة المشغّل</h1>
      <p className="mb-6 text-sm text-ink-soft">دخول مشرف المنصّة</p>

      {!configured ? (
        <div className="rounded-xl border border-gold/40 bg-gold-soft p-4 text-sm text-gold">
          لوحة المشغّل غير مُفعّلة. أضِف في ملف <code>.env</code>:
          <pre className="mt-2 whitespace-pre-wrap text-xs text-ink">
            {`PLATFORM_ADMIN_EMAIL="you@example.com"
PLATFORM_ADMIN_PASSWORD="كلمة-مرور-قوية"`}
          </pre>
        </div>
      ) : (
        <PlatformLoginForm />
      )}
    </div>
  );
}
