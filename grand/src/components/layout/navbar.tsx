"use client";
import Link from "@/components/ui/site-link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { localize } from "@/lib/i18n/config";
import { ThemeToggle } from "@/components/ui/theme-toggle";
const links = [
  { key: "home", path: "" },
  { key: "artifacts", path: "/artifacts" },
  { key: "tours", path: "/tour-planner" },
  { key: "map", path: "/museum-map" },
  { key: "scan", path: "/scan" },
] as const;
export function Navbar() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const locale = useLocale();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menu.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  function switchLanguage() {
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(
      /^\/(ar|en)(?=\/|$)/,
      locale === "ar" ? "/en" : "/ar",
    );
    router.push(`${url.pathname}${url.search}${url.hash}`);
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("skip")}
      </a>
      <div className="announcement">
        <span className="status-dot" />
        {common("demo")}
      </div>
      <header className="site-header">
        <div className="nav-shell">
          <Link
            className="brand"
            href={localize(locale, "")}
            aria-label={common("brandAr")}
          >
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 50 50" fill="none">
                <path
                  d="M5 39 25 5l20 34H5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M15 39 25 21l10 18M25 5v34M5 39h40"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="m13 25 12 14 12-14"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </span>
            <span className="brand-words">
              <strong>{common("brandAr")}</strong>
              <span>{common("brand")}</span>
            </span>
          </Link>
          <nav
            className={`primary-nav ${open ? "is-open" : ""}`}
            id="primary-navigation"
            aria-label={t("menu")}
          >
            {links.map((link) => {
              const href = localize(locale, link.path);
              const active = link.path ? path.startsWith(href) : path === href;
              return (
                <Link
                  key={link.key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <Link
              className="mobile-services"
              href={localize(locale, "/services")}
            >
              {t("services")}
            </Link>
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
            <button
              className="language-switch"
              onClick={switchLanguage}
              lang={locale === "ar" ? "en" : "ar"}
            >
              <Globe2 size={16} aria-hidden="true" />
              <span>{t("language")}</span>
            </button>
            <Link href={localize(locale, "/tour-planner")} className="nav-cta">
              {t("tours")}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button
              ref={menu}
              className="menu-toggle"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="primary-navigation"
              aria-label={t(open ? "close" : "menu")}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
