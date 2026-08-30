import type { z } from "zod";

/** حالة موحّدة لنماذج Server Actions مع useActionState. */
export interface FormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** رسالة نجاح اختيارية تُعرض في المكان. */
  message?: string;
}

export const emptyForm: FormState = {};

export function fail(error: string): FormState {
  return { error };
}

export function fromZod(err: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return {
    error: err.issues[0]?.message ?? "تحقّق من البيانات",
    fieldErrors,
  };
}
