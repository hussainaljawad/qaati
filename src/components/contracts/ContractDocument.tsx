import type { ContractDoc } from "@/lib/contracts/render";
import { formatMoney } from "@/lib/money";

/** تمثيل العقد للطباعة والعرض — تنسيق مستند رسمي بسيط. */
export function ContractDocument({
  doc,
  signedAt,
  signedByName,
}: {
  doc: ContractDoc;
  signedAt?: string | null;
  signedByName?: string | null;
}) {
  return (
    <article className="mx-auto bg-white text-[13px] leading-7 text-[#1a1a1a]">
      <header className="border-b-2 border-[#2A1B2E] pb-4 text-center">
        <h1 className="font-kufi text-xl font-bold">{doc.seller.name}</h1>
        <p className="mt-1 text-xs text-[#555]">
          {[doc.seller.address, doc.seller.phone].filter(Boolean).join(" · ")}
        </p>
        {(doc.seller.vatNumber || doc.seller.crNumber) && (
          <p className="text-xs text-[#555]">
            {doc.seller.crNumber ? `س.ت: ${doc.seller.crNumber}` : ""}
            {doc.seller.vatNumber
              ? `  ·  الرقم الضريبي: ${doc.seller.vatNumber}`
              : ""}
          </p>
        )}
      </header>

      <div className="my-5 text-center">
        <h2 className="font-kufi text-lg font-bold">عقد حجز قاعة</h2>
        <p className="text-xs text-[#555]">رقم العقد: {doc.contractNumber}</p>
      </div>

      <section className="mb-4">
        <p className="mb-1 font-bold">الطرف الأول (القاعة):</p>
        <p>{doc.seller.name}</p>
        <p className="mb-1 mt-3 font-bold">الطرف الثاني (العميل):</p>
        <p>
          {doc.client.name} — جوال: <span dir="ltr">{doc.client.phone}</span>
        </p>
      </section>

      <table className="mb-4 w-full border-collapse text-[12.5px]">
        <tbody>
          <Tr k="نوع المناسبة" v={doc.event.eventType} />
          <Tr k="القاعة" v={doc.event.hallName} />
          <Tr
            k="التاريخ"
            v={`${doc.event.dateText}  (${doc.event.hijriText} هـ)`}
          />
          {doc.event.timeText && <Tr k="الوقت" v={doc.event.timeText} />}
          {doc.event.guestsCount != null && (
            <Tr k="عدد الضيوف" v={String(doc.event.guestsCount)} />
          )}
          {doc.event.capacity != null && (
            <Tr k="سعة القاعة" v={String(doc.event.capacity)} />
          )}
        </tbody>
      </table>

      <table className="mb-4 w-full border-collapse text-[12.5px]">
        <tbody>
          <Tr
            k="القيمة الإجمالية"
            v={formatMoney(doc.pricing.totalFils, "ar")}
          />
          {doc.pricing.discountFils > 0 && (
            <Tr
              k="الخصم"
              v={`− ${formatMoney(doc.pricing.discountFils, "ar")}`}
            />
          )}
          <Tr k="الصافي" v={formatMoney(doc.pricing.netFils, "ar")} bold />
          <Tr
            k={`ضريبة القيمة المضافة (${doc.pricing.vatRate}%)`}
            v={
              formatMoney(doc.pricing.vatFils, "ar") +
              (doc.pricing.vatInclusive ? " (شاملة)" : " (تُضاف)")
            }
          />
        </tbody>
      </table>

      {doc.paymentPlan.length > 0 && (
        <section className="mb-4">
          <p className="mb-1 font-bold">جدول الدفع:</p>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#f3f0ea]">
                <Th>الدفعة</Th>
                <Th>المبلغ</Th>
                <Th>تاريخ الاستحقاق</Th>
              </tr>
            </thead>
            <tbody>
              {doc.paymentPlan.map((p, i) => (
                <tr key={i} className="border-b border-[#ddd]">
                  <Td>{p.label}</Td>
                  <Td>{formatMoney(p.amountFils, "ar")}</Td>
                  <Td>{p.dueDateText ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mb-6">
        <p className="mb-1 font-bold">الشروط والأحكام:</p>
        <div className="whitespace-pre-wrap text-[12.5px]">{doc.terms}</div>
      </section>

      <footer className="mt-10 grid grid-cols-2 gap-8 text-center text-[12.5px]">
        <div>
          <p className="border-t border-[#999] pt-2">
            توقيع الطرف الأول (القاعة)
          </p>
        </div>
        <div>
          <p className="border-t border-[#999] pt-2">
            توقيع الطرف الثاني (العميل)
            {signedAt && signedByName ? (
              <span className="mt-1 block text-[11px] text-[#555]">
                {signedByName} —{" "}
                {new Date(signedAt).toLocaleDateString("ar-BH")}
              </span>
            ) : null}
          </p>
        </div>
      </footer>
    </article>
  );
}

function Tr({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <tr className="border-b border-[#e5e5e5]">
      <td className="py-1.5 pe-3 text-[#555]">{k}</td>
      <td className={`py-1.5 ${bold ? "font-bold" : ""}`}>{v}</td>
    </tr>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-[#ddd] p-1.5 text-start font-semibold">
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="border border-[#ddd] p-1.5">{children}</td>;
}
