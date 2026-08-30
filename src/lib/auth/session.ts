import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySession,
  type SessionPayload,
} from "./jwt";

export type SessionUser = Awaited<ReturnType<typeof loadSession>>;

async function loadSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: {
      organization: { include: { subscription: true } },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    user,
    organization: user.organization,
    subscription: user.organization.subscription,
  };
}

/** جلسة الطلب الحالي (مخزّنة مؤقتاً — استعلام DB واحد لكل طلب). */
export const getSession = cache(loadSession);

/** معرّف المنشأة للطلب الحالي، أو null. مفيد لتقييد الاستعلامات بسرعة. */
export async function getOrgId(): Promise<string | null> {
  const session = await getSession();
  return session?.organization.id ?? null;
}

export async function createSessionCookie(
  payload: SessionPayload,
): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
