import Link from "@/components/ui/site-link";
import {
  Accessibility,
  Coffee,
  ShieldCheck,
  ScanLine,
  ArrowUpRight,
} from "lucide-react";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale, localize } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale).services;
  const items = [
    {
      key: "accessibility",
      text: "accessibilityText",
      icon: Accessibility,
      path: "/tour-planner",
      link: t.tour,
    },
    {
      key: "amenities",
      text: "amenitiesText",
      icon: Coffee,
      path: "/museum-map",
      link: t.map,
    },
    {
      key: "safety",
      text: "safetyText",
      icon: ShieldCheck,
      path: "/feedback",
      link: t.feedback,
    },
    {
      key: "privacy",
      text: "privacyText",
      icon: ScanLine,
      path: "/scan",
      link: locale === "ar" ? "التعرف على القطع" : "Artifact recognition",
    },
  ] as const;
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="muted">{t.description}</p>
      </header>
      <div className="services-grid">
        {items.map((i) => (
          <section className="panel service-card" key={i.key}>
            <i.icon size={30} strokeWidth={1.3} aria-hidden="true" />
            <h2>{t[i.key]}</h2>
            <p>{t[i.text]}</p>
            <Link className="text-link" href={localize(locale, i.path)}>
              {i.link}
              <ArrowUpRight size={16} />
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
