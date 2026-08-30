import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

/**
 * مصادقة لوحة المشغّل (Platform) — منفصلة تماماً عن مصادقة المستأجرين.
 * لا تعتمد على جدول users. الاعتماد على متغيّرات البيئة:
 *   PLATFORM_ADMIN_EMAIL     — إيميل الدخول
 *   PLATFORM_ADMIN_PASSWORD  — كلمة المرور (نص صريح — استخدم كلمة قوية)
 */

export const PLATFORM_COOKIE = "qaati_platform";
const MAX_AGE = 60 * 60 * 12; // ١٢ ساعة

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET مفقود");
  return new TextEncoder().encode(s);
}

export function isPlatformConfigured(): boolean {
  return Boolean(
    process.env.PLATFORM_ADMIN_EMAIL && process.env.PLATFORM_ADMIN_PASSWORD,
  );
}

/** مقارنة ثابتة الزمن قدر الإمكان. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function checkPlatformCredentials(
  email: string,
  password: string,
): boolean {
  if (!isPlatformConfigured()) return false;
  return (
    safeEqual(
      email.trim().toLowerCase(),
      process.env.PLATFORM_ADMIN_EMAIL!.trim().toLowerCase(),
    ) && safeEqual(password, process.env.PLATFORM_ADMIN_PASSWORD!)
  );
}

export async function createPlatformCookie(email: string): Promise<void> {
  const token = await new SignJWT({ role: "platform" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const store = await cookies();
  store.set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyPlatformCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PLATFORM_COOKIE);
}

async function loadPlatformSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(PLATFORM_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "platform" || typeof payload.sub !== "string")
      return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export const getPlatformSession = cache(loadPlatformSession);

export async function requirePlatform() {
  const session = await getPlatformSession();
  if (!session) redirect("/platform/login");
  return session;
}
