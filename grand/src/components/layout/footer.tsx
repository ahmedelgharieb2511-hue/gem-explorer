"use client";
import Link from "@/components/ui/site-link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { localize } from "@/lib/i18n/config";
export function Footer() {
  const locale = useLocale();
  const t = useTranslations("common");
  const nav = useTranslations("nav");
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div className="footer-wordmark">
            GEM<span>EXPLORER</span>
          </div>
          <p>{t("footerTag")}</p>
        </div>
        <nav aria-label={nav("services")} className="footer-links">
          {[
            { path: "artifacts", key: "artifacts" },
            { path: "services", key: "services" },
            { path: "audio-guide", key: "audio" },
            { path: "quests", key: "quests" },
            { path: "feedback", key: "feedback" },
            { path: "credits", key: "credits" },
          ].map((item) => (
            <Link key={item.path} href={localize(locale, `/${item.path}`)}>
              {nav(item.key)}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>{t("rights")}</span>
        <p>{t("independent")}</p>
        <span>2026</span>
      </div>
    </footer>
  );
}
