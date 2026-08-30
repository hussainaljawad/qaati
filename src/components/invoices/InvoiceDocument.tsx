import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";
import type { InvoiceWithRelations } from "@/lib/invoices/queries";

type Snap = {
  name?: string | null;
  vatNumber?: string | null;
  crNumber?: string | null;
  address?: string | null;
  phone?: string | null;
};

const STATUS_AR = {
  DRAFT: "مسودة",
  ISSUED: "صادرة",
  PAID: "مدفوعة",
  VOID: "ملغاة",
} as const;

/** فاتورة ضريبية متوافقة مع متطلبات البحرين (ثنائية اللغة). */
export function InvoiceDocument({
  invoice,
}: {
  invoice: InvoiceWithRelations;
}) {
  const seller = (invoice.sellerSnapshot ?? {}) as Snap;
  const buyer = (invoice.buyerSnapshot ?? {}) as Snap;
  const rate = Number(invoice.vatRate);

  return (
    <article className="mx-auto bg-white text-[13px] leading-6 text-[#1a1a1a]">
      <header className="flex items-start justify-between border-b-2 border-[#2A1B2E] pb-4">
        <div>
          <h1 className="font-kufi text-lg font-bold">{seller.name}</h1>
          {seller.address ? (
            <p className="text-xs text-[#555]">{seller.address}</p>
          ) : null}
          {seller.phone ? (
            <p className="text-xs text-[#555]" dir="ltr">
              {seller.phone}
            </p>
          ) : null}
          {seller.crNumber ? (
            <p className="text-xs text-[#555]">س.ت / CR: {seller.crNumber}</p>
          ) : null}
          {seller.vatNumber ? (
            <p className="text-xs text-[#555]">
              الرقم الضريبي / VAT: <span dir="ltr">{seller.vatNumber}</span>
            </p>
          ) : null}
        </div>
        <div className="text-end">
          <h2 className="font-kufi text-base font-bold">فاتورة ضريبية</h2>
          <p className="text-[11px] text-[#555]">Tax Invoice</p>
          <p className="mt-1 text-xs">
            رقم الفاتورة: <b dir="ltr">{invoice.invoiceNumber}</b>
          </p>
          <p className="text-xs">
            التاريخ:{" "}
            {formatDate(invoice.issueDate, "ar", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-xs">الحالة: {STATUS_AR[invoice.status]}</p>
        </div>
      </header>

      <section className="my-4">
        <p className="mb-1 font-bold">فاتورة إلى / Bill to:</p>
        <p>{buyer.name}</p>
        {buyer.phone ? (
          <p dir="ltr" className="text-xs text-[#555]">
            {buyer.phone}
          </p>
        ) : null}
        {buyer.address ? (
          <p className="text-xs text-[#555]">{buyer.address}</p>
        ) : null}
        {buyer.vatNumber ? (
          <p className="text-xs text-[#555]">
            الرقم الضريبي: <span dir="ltr">{buyer.vatNumber}</span>
          </p>
        ) : null}
      </section>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-[#f3f0ea]">
            <th className="border border-[#ddd] p-2 text-start">
              الوصف / Description
            </th>
            <th className="border border-[#ddd] p-2 w-16">الكمية</th>
            <th className="border border-[#ddd] p-2 w-28">السعر</th>
            <th className="border border-[#ddd] p-2 w-28">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((li) => (
            <tr key={li.id} className="border-b border-[#ddd]">
              <td className="border border-[#ddd] p-2">{li.description}</td>
              <td className="border border-[#ddd] p-2 text-center">
                {Number(li.quantity)}
              </td>
              <td className="border border-[#ddd] p-2">
                {formatMoney(li.unitPriceFils, "ar", { withSymbol: false })}
              </td>
              <td className="border border-[#ddd] p-2">
                {formatMoney(li.amountFils, "ar", { withSymbol: false })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 ms-auto w-64 space-y-1 text-[12.5px]">
        <Line
          k="المجموع قبل الضريبة"
          v={formatMoney(invoice.subtotalFils, "ar")}
        />
        <Line
          k={`ضريبة القيمة المضافة (${rate}%)`}
          v={formatMoney(invoice.vatFils, "ar")}
        />
        <Line
          k="الإجمالي المستحق / Total"
          v={formatMoney(invoice.totalFils, "ar")}
          bold
        />
      </div>

      {invoice.notes ? (
        <p className="mt-4 whitespace-pre-wrap text-[12px] text-[#555]">
          {invoice.notes}
        </p>
      ) : null}

      <p className="mt-8 text-center text-[11px] text-[#999]">
        كل المبالغ بالدينار البحريني (BHD). هذه فاتورة ضريبية صادرة وفق نظام
        ضريبة القيمة المضافة في مملكة البحرين.
      </p>
    </article>
  );
}

function Line({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between ${bold ? "border-t border-[#999] pt-1 font-bold" : ""}`}
    >
      <span className="text-[#555]">{k}</span>
      <span>{v}</span>
    </div>
  );
}
