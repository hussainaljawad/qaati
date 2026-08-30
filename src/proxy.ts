import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_PATHS,
  PLATFORM_COOKIE,
  PUBLIC_PATHS,
  SESSION_COOKIE,
} from "@/lib/auth/constants";

/**
 * حدود الشبكة (Next 16: كان اسمه middleware). يعمل على runtime = nodejs.
 * يتحقق فقط من *وجود* الكوكي لإعادة التوجيه السريع؛ التحقق الفعلي في الصفحات/الـ actions.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // لوحة المشغّل — مسار منفصل تماماً عن جلسة المستأجرين
  if (pathname.startsWith("/platform")) {
    const hasPlatform = request.cookies.has(PLATFORM_COOKIE);
    if (pathname === "/platform/login") {
      return hasPlatform
        ? NextResponse.redirect(new URL("/platform", request.url))
        : NextResponse.next();
    }
    return hasPlatform
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/platform/login", request.url));
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && !isPublic) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
