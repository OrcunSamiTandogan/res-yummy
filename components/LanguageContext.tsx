"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Locale } from "@/data/i18n";
import { DEFAULT_LOCALE } from "@/data/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Aktif dili tüm sayfaya yayar — LanguageSelector'dan seçilen dil, menü +
 * rezervasyon + kilometre taşlarındaki tüm metinleri aynı anda değiştirir.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}