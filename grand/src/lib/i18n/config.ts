import type { Locale, Localized } from "@/types";
export const locales = ["ar", "en"] as const;
export const defaultLocale: Locale = "ar";
export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}
export function localize(locale: string, path = "") {
  return `/${isLocale(locale) ? locale : defaultLocale}${path.startsWith("/") ? path : `/${path}`}`.replace(
    /\/$/,
    "",
  );
}
export function localized(value: Localized, locale: string) {
  return value[isLocale(locale) ? locale : "en"];
}
