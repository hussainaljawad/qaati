"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import {
  setInvoiceStatusAction,
  updateInvoiceLinesAction,
} from "@/app/actions/invoices";
import { emptyForm } from "@/lib/forms";
import { filsToBhd } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { FormError, TextInput } from "@/components/ui/Field";

type Line = { description: string; quantity: number; unitPriceBhd: number };

export function InvoiceEditor({
  invoiceId,
  status,
  lines: initialLines,
}: {
  invoiceId: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "VOID";
  lines: { description: string; quantity: number; unitPriceFils: number }[];
}) {
  const te = useTranslations("invoices.editor");
  const [lines, setLines] = useState<Line[]>(
    initialLines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPriceBhd: filsToBhd(l.unitPriceFils),
    })),
  );
  const [linesState, linesAction, linesPending] = useActionState(
    updateInvoiceLinesAction,
    emptyForm,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    setInvoiceStatusAction,
    emptyForm,
  );

  const nextStatuses: Record<string, { to: string; label: string }[]> = {
    DRAFT: [{ to: "ISSUED", label: te("issue") }],
    ISSUED: [
      { to: "PAID", label: te("markPaid") },
      { to: "VOID", label: te("void") },
    ],
    PAID: [{ to: "VOID", label: te("void") }],
    VOID: [{ to: "DRAFT", label: te("toDraft") }],
  };

  return (
    <div className="space-y-4">
      {status === "DRAFT" ? (
        <form action={linesAction} className="space-y-2">
          {linesState.error ? <FormError>{linesState.error}</FormError> : null}
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <p className="font-kufi text-sm font-bold text-ink">{te("lines")}</p>
          {lines.map((line, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-line bg-paper p-3"
            >
              <TextInput
                name="description"
                defaultValue={line.description}
                placeholder={te("desc")}
              />
              <div className="flex gap-2">
                <TextInput
                  name="quantity"
                  type="number"
                  dir="ltr"
                  min={1}
                  step="1"
                  defaultValue={line.quantity}
                  className="w-20"
                />
                <TextInput
                  name="unitPriceBhd"
                  type="number"
                  dir="ltr"
                  min={0}
                  step="0.001"
                  defaultValue={line.unitPriceBhd || ""}
                  placeholder={te("unitPrice")}
                />
                {lines.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-wine"
                    aria-label={te("removeLine")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setLines([
                ...lines,
                { description: "", quantity: 1, unitPriceBhd: 0 },
              ])
            }
            className="flex items-center gap-1 text-xs font-semibold text-gold"
          >
            <Plus className="size-4" /> {te("addLine")}
          </button>
          <Button
            type="submit"
            size="sm"
            disabled={linesPending}
            className="w-full"
          >
            {linesPending ? "…" : te("saveLines")}
          </Button>
        </form>
      ) : null}

      <div className="space-y-2">
        {statusState.error ? <FormError>{statusState.error}</FormError> : null}
        {(nextStatuses[status] ?? []).map((n) => (
          <form key={n.to} action={statusAction}>
            <input type="hidden" name="invoiceId" value={invoiceId} />
            <input type="hidden" name="status" value={n.to} />
            <Button
              type="submit"
              size="sm"
              variant={n.to === "VOID" ? "wine" : "primary"}
              disabled={statusPending}
              className="w-full"
            >
              {n.label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
