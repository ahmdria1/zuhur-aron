import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionary, type CopyKey } from "./copy";
import type { Locale } from "./catalog";

const STORAGE = "aron-locale";

type LocaleValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: CopyKey) => string;
  toggle: () => void;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE);
      if (saved === "en" || saved === "ar") setLocale(saved);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const value = useMemo<LocaleValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (key) => dictionary[locale][key],
      toggle: () => setLocale((current) => (current === "ar" ? "en" : "ar")),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
