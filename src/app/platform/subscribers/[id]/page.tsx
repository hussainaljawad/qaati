import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatform } from "@/lib/platform/auth";
import { getSubscriberDetail } from "@/lib/platform/queries";
import { formatDate } from "@/lib/format";
import { getLabels } from "@/lib/labels";
import { SubscriberActions } from "@/components/platform/SubscriberActions";

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "تجربة",
  ACTIVE: "مُفعّل",
  PAST_DUE: "متأخر السداد",
  EXPIRED: "منتهٍ",
  CANCELLED: "ملغى",
  NONE: "بلا اشتراك",
};

const EVENT_LABEL: Record<string, string> = {
  TRIAL_STARTED: "بدأت التجربة",
  ACTIVATED: "تفعيل",
  RENEWED: "تجديد / تمديد",
  PAST_DUE: "تأخّر سداد",
  CANCELLED: "إلغاء",
  EXPIRED: "انتهاء",
  REACTIVATED: "إعادة تفعيل",
};

export default async function SubscriberDetail({
  params,
}: PageProps<"/platform/subscribers/[id]">) {
  await requirePlatform();
  const { id } = await params;
  const data = await getSubscriberDetail(id);
  if (!data) notFound();

  const { org, status, trialDaysLeft } = data;
  const roleLabels = getLabels("ar").userRole;

  return (
    <div className="space-y-6">
      <Link href="/platform" className="text-xs font-semibold text-ink-soft">
        ‹ رجوع للقائمة
      </Link>

      <header>
        <h1 className="font-kufi text-xl font-bold">{org.name}</h1>
        <p className="text-xs text-ink-soft">
          <span dir="ltr">{org.slug}</span> · سجّل{" "}
          {formatDate(org.createdAt, "ar", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* الاشتراك */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-2 font-kufi text-sm font-bold">الاشتراك</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Row k="الحالة" v={STATUS_LABEL[status] ?? status} />
          <Row k="الباقة" v={org.subscription?.plan ?? "—"} />
          {status === "TRIALING" ? (
            <Row
              k="تنتهي التجربة"
              v={
                org.subscription?.trialEndsAt
                  ? `${formatDate(org.subscription.trialEndsAt, "ar", { day: "numeric", month: "long", year: "numeric" })} (${trialDaysLeft} يوم)`
                  : "—"
              }
            />
          ) : null}
          {org.subscription?.currentPeriodEnd ? (
            <Row
              k="تنتهي الفترة"
              v={formatDate(org.subscription.currentPeriodEnd, "ar", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          ) : null}
          <Row k="المزوّد" v={org.subscription?.provider ?? "manual"} />
        </dl>
        <div className="mt-3">
          <SubscriberActions orgId={org.id} status={status} />
        </div>
      </section>

      {/* بيانات المنشأة */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-2 font-kufi text-sm font-bold">بيانات المنشأة</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Row k="الهاتف" v={org.phone ?? "—"} />
          <Row k="الرقم الضريبي" v={org.vatNumber ?? "—"} />
          <Row k="السجل التجاري" v={org.crNumber ?? "—"} />
          <Row k="أكمل الإعداد" v={org.onboardedAt ? "نعم" : "لا"} />
          <Row k="قاعات" v={String(org._count.halls)} />
          <Row k="حجوزات" v={String(org._count.bookings)} />
          <Row k="عملاء" v={String(org._count.clients)} />
          <Row k="فواتير" v={String(org._count.invoices)} />
        </dl>
      </section>

      {/* المستخدمون */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-2 font-kufi text-sm font-bold">
          المستخدمون ({org.users.length})
        </h2>
        <ul className="space-y-1.5 text-sm">
          {org.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between">
              <span>
                {u.name}
                {u.isActive ? "" : " (موقوف)"}
              </span>
              <span className="text-[11px] text-ink-soft">
                <span dir="ltr">{u.email}</span> · {roleLabels[u.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* سجل الاشتراك */}
      <section className="rounded-xl border border-line bg-paper p-4">
        <h2 className="mb-2 font-kufi text-sm font-bold">سجل الاشتراك</h2>
        {org.subscriptionEvents.length === 0 ? (
          <p className="text-xs text-ink-soft">ما فيه سجلات</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {org.subscriptionEvents.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-2">
                <span>
                  {EVENT_LABEL[e.type] ?? e.type}
                  {e.note ? (
                    <span className="text-[11px] text-ink-soft">
                      {" "}
                      — {e.note}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] text-ink-soft">
                  {formatDate(e.createdAt, "ar", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-ink-soft">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}
