"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const preference = useRef<Theme | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let saved: unknown;
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* The toggle also works without storage. */
    }
    preference.current = isTheme(saved) ? saved : null;
    const update = (value: Theme) => {
      applyTheme(value);
      setTheme(value);
    };
    const initial =
      preference.current ??
      (isTheme(document.documentElement.dataset.theme)
        ? document.documentElement.dataset.theme
        : media.matches
          ? "dark"
          : "light");
    update(initial);
    const onSystemChange = () => {
      if (!preference.current) update(media.matches ? "dark" : "light");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      preference.current = isTheme(event.newValue) ? event.newValue : null;
      update(preference.current ?? (media.matches ? "dark" : "light"));
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    preference.current = next;
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Keep the current page usable in private browsing. */
    }
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}
