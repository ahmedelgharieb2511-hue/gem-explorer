import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { isTheme, THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
function runBootstrap(
  saved: unknown,
  systemDark = false,
  storageBlocked = false,
) {
  const root = {
    dataset: {} as Record<string, string>,
    style: {} as Record<string, string>,
  };
  new vm.Script(THEME_BOOTSTRAP_SCRIPT).runInNewContext({
    document: { documentElement: root },
    localStorage: {
      getItem: () => {
        if (storageBlocked) throw new Error("Blocked");
        return saved;
      },
    },
    window: { matchMedia: () => ({ matches: systemDark }) },
  });
  return root;
}
describe("color theme before hydration", () => {
  it("restores dark preference before application code runs", () => {
    expect(runBootstrap("dark").dataset.theme).toBe("dark");
  });
  it("honors saved light preference over system dark", () => {
    expect(runBootstrap("light", true).style.colorScheme).toBe("light");
  });
  it("ignores unknown stored values and follows the system", () => {
    expect(runBootstrap("sepia", true).dataset.theme).toBe("dark");
  });
  it("works when browser storage is blocked", () => {
    expect(runBootstrap(null, true, true).dataset.theme).toBe("dark");
  });
  it("accepts only the two supported themes", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme(null)).toBe(false);
    expect(isTheme("system")).toBe(false);
  });
});
