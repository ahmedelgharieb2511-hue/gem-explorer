import { notFound } from "next/navigation";
import { Home } from "@/components/shared/home";
import { isLocale } from "@/lib/i18n/config";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Home locale={locale} />;
}
