import { SignJWT, jwtVerify } from "jose";

export { SESSION_COOKIE } from "./constants";

/**
 * توقيع/تحقق رمز الجلسة (JWT). معزول في وحدة مستقلة بلا أي استيراد من Prisma
 * حتى يمكن استخدامه في مكوّنات الخادم مباشرة.
 */

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // ٣٠ يوم بالثواني

export interface SessionPayload {
  sub: string; // userId
  org: string; // organizationId
  role: "ADMIN" | "STAFF";
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET مفقود أو قصير. ولّد واحداً بـ: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ org: payload.org, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.org !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "STAFF")
    ) {
      return null;
    }
    return { sub: payload.sub, org: payload.org, role: payload.role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
