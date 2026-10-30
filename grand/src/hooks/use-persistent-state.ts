"use client";
import { useEffect, useState } from "react";
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (validate(saved)) setValue(saved);
    } catch {
      /* Private browsing or corrupt preferences. */
    }
    setLoaded(true);
  }, [key, validate]);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [key, value, loaded]);
  return [value, setValue, loaded] as const;
}
