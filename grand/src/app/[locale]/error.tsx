"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="page-shell empty-state" role="alert">
      <p className="eyebrow">GEM EXPLORER</p>
      <h1>{t("error")}</h1>
      <p>{t("errorDescription")}</p>
      <button className="button" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
