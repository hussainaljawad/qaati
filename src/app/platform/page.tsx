import Link from "next/link";
import { requirePlatform } from "@/lib/platform/auth";
import { listSubscribers, platformDashboard } from "@/lib/platform/queries";
import { platformLogoutAction } from "@/app/actions/platform";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { SubscriberActions } from "@/components/platform/SubscriberActions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  TRIALING: { label: "تجربة", cls: "bg-gold-soft text-gold" },
  ACTIVE: { label: "مُفعّل", cls: "bg-olive-soft text-olive" },
  PAST_DUE: { label: "متأخر السداد", cls: "bg-wine-soft text-wine" },
  EXPIRED: { label: "منتهٍ", cls: "bg-paper-2 text-ink-soft" },
  CANCELLED: { label: "ملغى", cls: "bg-paper-2 text-ink-soft" },
  NONE: { label: "بلا اشتراك", cls: "bg-paper-2 text-ink-soft" },
};

const EVENT_META: Record<string, { label: string; dot: string }> = {
  TRIAL_STARTED: { label: "تسجيل جديد", dot: "bg-gold" },
  ACTIVATED: { label: "تفعيل اشتراك", dot: "bg-olive" },
  RENEWED: { label: "تمديد", dot: "bg-olive" },
  REACTIVATED: { label: "تمديد تجربة", dot: "bg-gold" },
  PAST_DUE: { label: "تأخّر سداد", dot: "bg-wine" },
  CANCELLED: { label: "إلغاء", dot: "bg-wine" },
  EXPIRED: { label: "انتهاء", dot: "bg-ink-soft" },
};

export default async function PlatformHome({
  searchParams,
}: PageProps<"/platform">) {
  const session = await requirePlatform();
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : "";

  const [d, subs] = await Promise.all([
    platformDashboard(),
    listSubscribers(search),
  ]);

  const maxGrowth = Math.max(1, ...d.growth.map((g) => g.count));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="font-kufi text-xl font-bold">لوحة المشغّل</h1>
          <p className="text-xs text-ink-soft" dir="ltr">
            {session.email}
          </p>
        </div>
        <form action={platformLogoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft"
          >
            خروج
          </button>
        </form>
      </header>

      {/* مؤشرات رئيسية */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          value={formatMoney(d.mrrFils, "ar", { compact: true })}
          label="الإيراد الشهري المتكرر"
          hint={`سنوياً ${formatMoney(d.arrFils, "ar", { compact: true })}`}
          tone="olive"
        />
        <Metric
          value={String(d.counts.active)}
          label="مشترك مُفعّل"
          hint={
            d.activatedThisMonth > 0 ? `+${d.activatedThisMonth} هذا الشهر` : "—"
          }
        />
        <Metric
          value={String(d.counts.trialing)}
          label="في التجربة"
          hint={
            d.trialsEndingSoon.length > 0
              ? `${d.trialsEndingSoon.length} تنتهي قريباً`
              : "—"
          }
          tone="gold"
        />
        <Metric
          value={`${d.conversionRate}%`}
          label="معدّل التحويل"
          hint="تجربة ← اشتراك"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
        <MiniStat n={d.counts.total} label="إجمالي المنشآت" />
        <MiniStat n={d.newThisMonth} label="تسجيل هذا الشهر" />
        <MiniStat n={d.churnedThisMonth} label="إلغاء هذا الشهر" />
        <MiniStat n={d.counts.pastDue} label="متأخر السداد" />
        <MiniStat n={d.counts.expired} label="منتهٍ" />
        <MiniStat n={d.counts.cancelled} label="ملغى" />
      </div>

      {/* رسم النمو */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-3 font-kufi text-sm font-bold">نمو التسجيلات — آخر ٦ أشهر</h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {d.growth.map((g) => (
            <div key={g.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[11px] font-bold text-ink">{g.count}</span>
              <div
                className="w-full rounded-t-md bg-gold"
                style={{
                  height: `${Math.max(4, (g.count / maxGrowth) * 90)}px`,
                }}
              />
              <span className="text-[10px] text-ink-soft">{g.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* عمودان: تجارب تنتهي + النشاط */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-paper p-4">
          <h2 className="mb-2 font-kufi text-sm font-bold">تجارب تنتهي خلال أسبوع</h2>
          {d.trialsEndingSoon.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-soft">لا شيء</p>
          ) : (
            <ul className="space-y-1.5">
              {d.trialsEndingSoon.map((t) => (
                <li
                  key={t.organizationId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <Link
                    href={`/platform/subscribers/${t.organizationId}`}
                    className="font-medium text-ink hover:text-gold"
                  >
                    {t.name}
                  </Link>
                  <span className="text-[11px] font-semibold text-wine">
                    {t.days <= 0 ? "انتهت" : `${t.days} يوم`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-paper p-4">
          <h2 className="mb-2 font-kufi text-sm font-bold">آخر النشاط</h2>
          {d.recentEvents.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-soft">لا نشاط</p>
          ) : (
            <ul className="space-y-1.5">
              {d.recentEvents.map((e) => {
                const meta = EVENT_META[e.type] ?? {
                  label: e.type,
                  dot: "bg-ink-soft",
                };
                return (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <span className={`size-1.5 shrink-0 rounded-full ${meta.dot}`} />
                    <Link
                      href={`/platform/subscribers/${e.organization.id}`}
                      className="min-w-0 flex-1 truncate hover:text-gold"
                    >
                      <b className="font-semibold">{meta.label}</b>{" "}
                      <span className="text-ink-soft">— {e.organization.name}</span>
                    </Link>
                    <span className="shrink-0 text-[11px] text-ink-soft">
                      {formatDate(e.createdAt, "ar", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* البحث + القائمة */}
      <form>
        <input
          name="q"
          defaultValue={search}
          placeholder="ابحث باسم المنشأة أو بريد المالك"
          className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </form>

      <div className="grid gap-2 lg:grid-cols-2">
        {subs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft lg:col-span-2">
            ما فيه منشآت
          </p>
        ) : (
          subs.map((s) => {
            const meta = STATUS_META[s.status] ?? STATUS_META.NONE;
            const endDate =
              s.status === "TRIALING"
                ? s.trialEndsAt
                : s.status === "ACTIVE" || s.status === "PAST_DUE"
                  ? s.currentPeriodEnd
                  : null;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-line bg-paper p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/platform/subscribers/${s.id}`}
                      className="font-kufi text-sm font-bold text-ink hover:text-gold"
                    >
                      {s.name}
                    </Link>
                    <p className="text-[11px] text-ink-soft">
                      {s.owner ? `${s.owner.name} · ` : ""}
                      <span dir="ltr">{s.owner?.email ?? "—"}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-ink-soft">
                      {formatDate(s.createdAt, "ar", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {s.counts.halls} قاعة · {s.counts.bookings} حجز ·{" "}
                      {s.counts.users} مستخدم
                      {!s.onboarded ? " · لم يكمل الإعداد" : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}
                    >
                      {meta.label}
                      {s.status === "TRIALING" && s.trialDaysLeft > 0
                        ? ` · ${s.trialDaysLeft} يوم`
                        : ""}
                    </span>
                    {endDate ? (
                      <span className="text-[10px] text-ink-soft">
                        حتى{" "}
                        {formatDate(endDate, "ar", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3">
                  <SubscriberActions orgId={s.id} status={s.status} compact />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  hint,
  tone,
}: {
  value: string;
  label: string;
  hint?: string;
  tone?: "olive" | "gold" | "wine";
}) {
  const c =
    tone === "olive"
      ? "text-olive"
      : tone === "gold"
        ? "text-gold"
        : tone === "wine"
          ? "text-wine"
          : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className={`font-kufi text-xl font-bold ${c}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink">{label}</p>
      {hint ? <p className="text-[11px] text-ink-soft">{hint}</p> : null}
    </div>
  );
}

function MiniStat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper px-2 py-2">
      <p className="font-kufi text-base font-bold text-ink">{n}</p>
      <p className="text-[10px] text-ink-soft">{label}</p>
    </div>
  );
}
