import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/shared/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale, locales } from "@/lib/i18n/config";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "../globals.css";
import "../theme.css";
import "@fontsource-variable/cairo";
import "@fontsource-variable/manrope";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default:
        locale === "ar"
          ? "مستكشف المتحف | حكايات تستحق الاكتشاف"
          : "GEM Explorer | Every object has a story",
      template: "%s | GEM Explorer",
    },
    description:
      locale === "ar"
        ? "تجربة زيارة تعليمية: استكشف القطع وخطط لجولتك. نموذج مستقل للهاكاثون."
        : "Explore the collection, plan a personal tour and follow your curiosity. An independent hackathon concept.",
    robots: { index: false, follow: false },
    applicationName: "GEM Explorer",
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <script
          id="gem-theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>
        <Providers locale={locale} messages={getMessages(locale)}>
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
