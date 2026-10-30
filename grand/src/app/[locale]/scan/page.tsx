import { ScanExperience } from "@/features/ai-recognition";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale).recognition;
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">{t.qrEyebrow}</p>
        <h1>{t.title}</h1>
      </header>
      <ScanExperience />
    </div>
  );
}
