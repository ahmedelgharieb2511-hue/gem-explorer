"use client";
import { useTranslations } from "next-intl";
export default function Loading() {
  const t = useTranslations("common");
  return (
    <div className="page-shell loading-page" role="status">
      <span className="loading-spinner" />
      <p>{t("loading")}</p>
    </div>
  );
}
