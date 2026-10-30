import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import { getMessages } from "@/lib/i18n/messages";
import { isLocale, localize } from "@/lib/i18n/config";
function keys(value: object, prefix = ""): string[] {
  return Object.entries(value)
    .flatMap(([key, item]) =>
      typeof item === "object"
        ? keys(item, prefix + key + ".")
        : [prefix + key],
    )
    .sort();
}
describe("locale parity and navigation", () => {
  it("has the same translation keys in both languages", () =>
    expect(keys(getMessages("ar"))).toEqual(keys(getMessages("en"))));
  it("preserves localized links and query strings", () => {
    expect(localize("ar", "/artifacts?q=gold")).toBe("/ar/artifacts?q=gold");
    expect(localize("en", "")).toBe("/en");
    expect(isLocale("fr")).toBe(false);
  });
  it("uses real Arabic and English plural rules", () => {
    const en = createTranslator({ locale: "en", messages: getMessages("en") });
    const ar = createTranslator({ locale: "ar", messages: getMessages("ar") });
    expect(en("artifacts.results", { count: 1 })).toContain("1 object");
    expect(ar("artifacts.results", { count: 2 })).toContain("قطعتان");
  });
});
