"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { updateClientTagsAction } from "@/app/actions/communications";
import { emptyForm } from "@/lib/forms";
import { TextInput } from "@/components/ui/Field";

export function ClientTags({
  clientId,
  tags,
}: {
  clientId: string;
  tags: string[];
}) {
  const t = useTranslations("clients.profile");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    updateClientTagsAction,
    emptyForm,
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.ok) setEditing(false);
  }, [state.ok]);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-medium text-gold"
          >
            {tag}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] font-semibold text-ink-soft"
        >
          {tags.length ? t("editTags") : t("addTags")}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <TextInput
        name="tags"
        defaultValue={tags.join("، ")}
        placeholder={t("tagsPlaceholder")}
        className="flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gold px-3 text-xs font-semibold text-ink"
      >
        {tc("save")}
      </button>
    </form>
  );
}
