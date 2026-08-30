import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import { localeDirection, type Locale } from "@/i18n/config";
import "./globals.css";

const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-kufi",
  display: "swap",
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "قاعتي — إدارة قاعات المناسبات", template: "%s · قاعتي" },
  description:
    "نظام إدارة قاعات الأفراح والمناسبات: تقويم بلا تعارض، دفعات على مراحل، فواتير ضريبية، وتذكيرات واتساب.",
  applicationName: "قاعتي",
};

export const viewport: Viewport = {
  themeColor: "#2A1B2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = (await getLocale()) as Locale;

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${kufi.variable} ${plex.variable} h-full`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
