"use server";

import { redirect } from "next/navigation";
import { addDays } from "date-fns";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, destroySessionCookie } from "@/lib/auth/session";
import { makeSlug } from "@/lib/slug";
import { TRIAL_DAYS } from "@/lib/billing/plans";
import { loginSchema, signupSchema } from "@/lib/validation";

/** `code` مفتاح ترجمة تحت auth.errors.*؛ `message` نص جاهز (من zod) عند وجوده. */
export interface AuthState {
  code?: "emailTaken" | "invalidCredentials" | "weakPassword" | "generic";
  message?: string;
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "تحقّق من البيانات" };
  }
  const { name, hallName, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { code: "emailTaken" };

  const passwordHash = await hashPassword(password);
  const trialEndsAt = addDays(new Date(), TRIAL_DAYS);

  let userId: string;
  let orgId: string;
  try {
    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: hallName, slug: makeSlug(hallName) },
      });
      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          name,
          email,
          passwordHash,
          role: "ADMIN",
        },
      });
      await tx.subscription.create({
        data: { organizationId: org.id, status: "TRIALING", trialEndsAt },
      });
      await tx.subscriptionEvent.create({
        data: {
          organizationId: org.id,
          type: "TRIAL_STARTED",
          note: `تجربة ${TRIAL_DAYS} يوم`,
        },
      });
      return { userId: user.id, orgId: org.id };
    });
    userId = result.userId;
    orgId = result.orgId;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { code: "emailTaken" };
    }
    console.error("signup failed", err);
    return { code: "generic" };
  }

  await createSessionCookie({ sub: userId, org: orgId, role: "ADMIN" });
  redirect("/onboarding");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { code: "invalidCredentials" };

  const { email, password } = parsed.data;
  const nextPath = String(formData.get("next") ?? "") || "/dashboard";

  const user = await db.user.findUnique({ where: { email } });
  if (
    !user ||
    !user.isActive ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return { code: "invalidCredentials" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSessionCookie({
    sub: user.id,
    org: user.organizationId,
    role: user.role,
  });

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/login");
}
