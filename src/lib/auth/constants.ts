/** اسم كوكي الجلسة — معزول ليُستورد في `proxy.ts` بلا سحب تبعيات. */
export const SESSION_COOKIE = "qaati_session";

/** كوكي لوحة المشغّل (Platform) — منفصلة عن جلسة المستأجرين. */
export const PLATFORM_COOKIE = "qaati_platform";

/** المسارات العامة (لا تتطلب تسجيل دخول). */
export const PUBLIC_PATHS = ["/", "/pricing", "/login", "/signup"];

/** صفحات الدخول/التسجيل — يُعاد توجيه المسجّل منها إلى لوحة التحكم. */
export const AUTH_PATHS = ["/login", "/signup"];
