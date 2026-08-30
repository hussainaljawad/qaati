"use client";

import { useActionState, useEffect, useState } from "react";
import { MessageSquarePlus, Phone, StickyNote, Users2 } from "lucide-react";
import {
  addCommunicationAction,
  deleteCommunicationAction,
} from "@/app/actions/communications";
import { emptyForm } from "@/lib/forms";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { getLabels } from "@/lib/labels";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

type Entry = {
  id: string;
  type: "NOTE" | "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SPECIAL_REQUEST";
  body: string;
  createdAt: string;
  createdByName: string | null;
  bookingRef: string | null;
};

const ICON = {
  CALL: Phone,
  MEETING: Users2,
  WHATSAPP: MessageSquarePlus,
} as const;

export function CommunicationTimeline({
  clientId,
  entries,
  locale,
}: {
  clientId: string;
  entries: Entry[];
  locale: Locale;
}) {
  const t = useTranslations("clients.timeline");
  const tc = useTranslations("common");
  const commLabels = getLabels(locale).communicationType;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    addCommunicationAction,
    emptyForm,
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-kufi text-sm font-bold text-ink">{t("title")}</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-gold"
        >
          {open ? tc("cancel") : t("add")}
        </button>
      </div>

      {open ? (
        <form
          action={action}
          className="mb-3 space-y-2 rounded-xl border border-line bg-paper p-3"
        >
          {state.error ? <FormError>{state.error}</FormError> : null}
          <input type="hidden" name="clientId" value={clientId} />
          <Field label={t("typeLabel")}>
            <Select name="type" defaultValue="NOTE">
              {Object.entries(commLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("bodyLabel")}>
            <Textarea name="body" rows={3} required />
          </Field>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? tc("sending") : tc("save")}
          </Button>
        </form>
      ) : null}

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const Icon = ICON[e.type as keyof typeof ICON] ?? StickyNote;
            return (
              <li
                key={e.id}
                className="rounded-xl border border-line bg-paper p-3"
              >
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink-soft">
                      {commLabels[e.type]} ·{" "}
                      {formatDate(e.createdAt, locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {e.createdByName ? ` · ${e.createdByName}` : ""}
                      {e.bookingRef
                        ? ` · ${t("bookingTag", { ref: e.bookingRef })}`
                        : ""}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-ink">
                      {e.body}
                    </p>
                  </div>
                  <form action={deleteCommunicationAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="text-[11px] font-semibold text-wine"
                    >
                      {tc("delete")}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
