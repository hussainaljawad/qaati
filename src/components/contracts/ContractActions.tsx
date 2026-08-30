"use client";

import { useActionState, useState } from "react";
import {
  signContractAction,
  updateContractTermsAction,
} from "@/app/actions/contracts";
import { emptyForm } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

export function ContractActions({
  contractId,
  terms,
  signed,
}: {
  contractId: string;
  terms: string;
  signed: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [signing, setSigning] = useState(false);

  const [termsState, termsAction, termsPending] = useActionState(
    updateContractTermsAction,
    emptyForm,
  );
  const [signState, signAction, signPending] = useActionState(
    signContractAction,
    emptyForm,
  );

  if (signed) {
    return (
      <p className="rounded-xl bg-olive-soft px-3 py-2 text-sm font-medium text-olive">
        العقد موقّع — لا يمكن تعديله.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-gold"
        >
          تعديل الشروط
        </button>
      ) : (
        <form action={termsAction} className="space-y-2">
          {termsState.error ? <FormError>{termsState.error}</FormError> : null}
          <input type="hidden" name="contractId" value={contractId} />
          <Field label="الشروط والأحكام">
            <Textarea name="terms" rows={10} defaultValue={terms} />
          </Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={termsPending}
              className="flex-1"
            >
              حفظ
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setEditing(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {!signing ? (
        <Button
          type="button"
          onClick={() => setSigning(true)}
          className="w-full"
        >
          تعليم العقد كموقّع
        </Button>
      ) : (
        <form
          action={signAction}
          className="space-y-2 rounded-xl border border-line p-3"
        >
          {signState.error ? <FormError>{signState.error}</FormError> : null}
          <input type="hidden" name="contractId" value={contractId} />
          <Field label="اسم من وقّع العقد">
            <TextInput name="signedByName" required />
          </Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={signPending}
              className="flex-1"
            >
              تأكيد التوقيع
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setSigning(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
