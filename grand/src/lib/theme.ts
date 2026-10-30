export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "gem-color-theme";
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}
// Static application code only: no user input is interpolated into this script.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){var theme="light";try{var saved=localStorage.getItem("gem-color-theme");theme=saved==="light"||saved==="dark"?saved:window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}catch(e){theme=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;})();`;
